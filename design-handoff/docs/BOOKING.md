# Booking: flow and Google Calendar integration

Booking works like a checkout. The visitor picks a clinician (on the profile), picks a time, enters details and is confirmed. Only free consultations are booked online. Assessments and ongoing sessions are scheduled by the clinician afterwards.

Copy for every step lives in `content/pages/booking.json` (`schemas/booking.json`). Clinician rules (hours, buffer, notice, calendar ID, session types) live in the clinician entry's `booking` and `fees` zones.

## 1. Entry points

- **Profile slot link:** `/book?clinician={slug}&slot={ISO-8601 start, UTC}` opens step 1 with that time selected.
- **Profile "Book a Consultation" / "See all open times":** `/book?clinician={slug}` opens step 1 with no time selected.
- **Anything else** (no or unknown `clinician`, clinician not accepting clients): redirect to `/clinicians`.
- **Stale `slot`** (no longer free, past, or outside the rules): open step 1 with nothing selected and the message "That time is no longer available. Please choose another."

## 2. The 3 steps

The route is `/book` for steps 1 and 2 (client state) and `/book/confirmed` for step 3. Progress shows "Step n of 3" and a 3-part bar (Time · Your details · Confirmed).

The **summary panel** shows on every step. It is a sidebar on desktop and sits above the form on mobile. It shows:

- clinician portrait, name and credentials, linked to the profile
- session ("Consultation · 15 min")
- the selected time, or "Choose a time"
- format
- cost ("Free")
- "Change time or format" (steps 1 and 2 only)

### Step 1: Time

- **Times:** radio buttons for open times, grouped by day, labelled in the clinician's time zone with "ET" shown. Show the next 14 days first, with "Show more times" up to `maxDaysAhead`.
- **Format:** radio buttons for Video call or Phone call, taken from the consultation session type's `modes`.
- **Continue:** goes to step 2. If no time is selected, show the text error "Error: choose a time."

### Step 2: Your details

- **Fields:** full name, email (with its hint), phone, and how they plan to pay (Self-pay / Insurance / Not sure yet).
- **Consent:** a required checkbox: not an emergency service, 988 in a crisis.
- **Bot protection:** a hidden honeypot field, and Cloudflare Turnstile (invisible).
- **Validation:** on submit, with server-side validation as the source of truth (zod).
  - An error summary (`role="alert"`) shows "Please fix {count} to continue."
  - Each invalid field gets a per-field "Error: …" text, `aria-invalid`, and `aria-describedby`.
  - Focus moves to the summary.
- **"Confirm booking":** POSTs to `/api/bookings`. While waiting, the button shows a busy state and can't be pressed twice.
- **"Back":** returns to step 1 with the inputs kept.

### Step 3: Confirmed (`/book/confirmed?token=…`)

- **Message:** H1 "You're booked.", then "Your consultation with {firstName} is on {time}, by {format}."
- **Add to calendar:**
  - Google: a `calendar.google.com/calendar/render?action=TEMPLATE…` link
  - Apple: `.ics` from `/api/bookings/ics?token=…`
  - Outlook: an `outlook.live.com/calendar/0/deeplink/compose…` link
- **Next steps:** the "What happens next" list, then the change/cancel policy and "Return to home".
- **Token:** a signed (HMAC-SHA256), short-lived token holding `{eventId, clinicianSlug, start, end, format}`. It holds **no** name, email or phone. The email shown on this page comes from in-memory state. After a reload it falls back to "your email".

### Focus and announcements

- On each step change, move focus to the step's H1.
- An `aria-live="polite"` region announces "Step n of 3".
- No animations beyond what `prefers-reduced-motion` allows.

## 3. Google Calendar integration

### Account requirement (decide before building, see OPEN_QUESTIONS #1)

Use **Google Workspace** with a signed **HIPAA Business Associate Agreement**. A personal Gmail account is not HIPAA-eligible and can't be used for client bookings. Workspace also enables what the integration needs:

- A **service account with domain-wide delegation**, impersonating each clinician's Workspace user. Service accounts can only invite attendees and create Google Meet links through domain-wide delegation.
- **Scopes:** `https://www.googleapis.com/auth/calendar.events` and `https://www.googleapis.com/auth/calendar.freebusy`.

### Provider interface

Put all calendar code behind `lib/scheduling/`:

```ts
interface SchedulingProvider {
  getBusy(calendarId: string, from: Date, to: Date): Promise<Interval[]>;
  createConsultation(input: {
    calendarId: string; impersonate: string; eventId: string;
    start: Date; end: Date; format: 'video' | 'phone';
    client: { name: string; email: string; phone: string };
  }): Promise<{ eventId: string; meetUrl?: string }>;
}
```

There are two implementations:

- `GoogleCalendarProvider` (production)
- `MockProvider` (in-memory busy times; used in dev, tests and preview deploys unless `SCHEDULING_PROVIDER=google`)

### Computing open times (`lib/scheduling/slots.ts`, pure and unit-tested)

The inputs are the clinician's `booking` zone (`timezone`, `weeklyHours`, `bufferMinutes`, `minNoticeHours`, `maxDaysAhead`), the consultation `minMinutes` (15), and busy intervals from `freebusy.query`.

1. Expand `weeklyHours` into concrete windows in the clinician's time zone for each day from now to `maxDaysAhead`. It must be DST-safe: use `@date-fns/tz` or Luxon, never manual offsets.
2. Generate candidate starts every 15 minutes, aligned to :00/:15/:30/:45, inside each window, such that `start + duration ≤ window end`.
3. Drop candidates earlier than `now + minNoticeHours`.
4. Drop candidates where `[start − buffer, end + buffer]` overlaps any busy interval.
5. Return them sorted. The profile shows the first `slotsShown`. The Home card and closing CTA use the first one ("Next open").

Read path:

- `GET /api/availability?clinician={slug}&from={date}&to={date}` returns a list of `{start, end}` in UTC.
- Cache in memory or KV for 5 minutes per clinician and range.
- Profiles and cards render times on the server with the same cache.

### Creating a booking (`POST /api/bookings`)

1. **Validate** the body with zod. Check the honeypot (if filled, return 200 with a fake success and do nothing). Verify Turnstile. Rate limit to 5 requests per IP per hour and 20 per clinician per hour.
2. **Check the time.** Load the clinician and confirm the requested `start` is still in the slot list, recomputing with a fresh `freebusy.query` and no cache.
3. **Build a deterministic event ID:** `base32hex(sha256(clinicianSlug + startISO))`, truncated to 32 characters (Calendar IDs allow a–v and 0–9). If two requests race for the same time, the second insert gets HTTP 409. Treat that as "slot taken".
4. **Call `events.insert`** on the clinician's calendar with `conferenceDataVersion=1` and `sendUpdates=all`:
   - `id`: the deterministic ID
   - `summary`: "Consultation · website booking". Keep client names out of the title.
   - `start`/`end`: with `timeZone` set to the clinician's time zone
   - `attendees`: `[{ email: client.email, displayName: client.name }]`
   - **Video:** `conferenceData.createRequest = { requestId: eventId, conferenceSolutionKey: { type: 'hangoutsMeet' } }`
   - **Phone:** no conference. Set `location` to "Phone call: {clinician} will call you" and put the client's phone number in a private extended property (`extendedProperties.private.clientPhone`) so it isn't shown to the attendee.
   - `description`: a fixed, non-clinical line plus the change/cancel policy. Never include a reason for visit, insurance or other notes.
   - `reminders`: use the calendar's defaults.
5. **On success**, return `{ token }`, the signed confirmation token. Then send the server-side Google Ads conversion (see SPEC §7), with the `gclid` only.
6. **On a 409 or a stale time,** return `409 { code: 'SLOT_TAKEN' }`. The UI returns to step 1 with fresh times and "That time was just booked. Please choose another."
7. **On any other Google error,** return 502. The UI shows "We couldn't complete your booking. Please try again, or call [phone]." Log the error without client data.

Google's invite email is the client's confirmation and carries the Meet link. The practice's own branded confirmation email is out of scope for Phase 3; see OPEN_QUESTIONS #6.

### Environment variables

```
SCHEDULING_PROVIDER=google            # or mock
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=   # PEM, newlines escaped
GOOGLE_IMPERSONATE_DEFAULT=           # fallback Workspace user; per-clinician owner = calendar ID owner
BOOKING_TOKEN_SECRET=                 # 32+ random bytes
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
GOOGLE_ADS_CONVERSION_ACTION=         # Phase 5
```

## 4. Tests

- **Unit (`slots.ts`):** DST transition weeks, buffer edges, min notice, windows shorter than a slot, busy blocks that overlap several candidates.
- **API:** validation errors, honeypot, Turnstile failure, slot taken (409), Google error (502), rate limit.
- **E2E (Playwright, MockProvider):**
  - profile → slot → step 2 → confirm → step 3, at 1440px and 390px
  - keyboard-only run of the same path
  - axe on each step
  - a direct visit to `/book` redirects to `/clinicians`
