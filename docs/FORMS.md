# Forms

Ported from jessrebelo.com (`lib/submission`). Plan: TWS-108 (intake) and TWS-109 (approve to book).
Reworked for UPTG-38 (compliance finding 2): **client details never pass through the Cloudflare
Worker.** Cloudflare signs a HIPAA BAA only on Enterprise plans; the Google Workspace BAA covers
Apps Script, Sheets and Gmail.

## Flow

```
Browser form (honeypot + Turnstile), lib/forms/submit.ts
  1. POST /api/ticket { formType, turnstileToken, website, isTest, slot? }   <- no client details
     Worker (app/api/ticket/route.ts)
       a. Rate limit (SUBMIT_LIMITER: 3 per IP per minute)
       b. Honeypot (filled: ok with ticket null), then Turnstile
       c. Booking: the slot check against a fresh calendar read (409 SLOT_TAKEN)
       d. Debug log: 1 DynamoDB item, metadata only (fail open)
       e. Answer { ok, id, ticket }: a signed ticket that expires in 10 minutes
  2. POST {APPS_SCRIPT_URL} (text/plain) { ticket, fields }                  <- details go here only
     Apps Script doPost: check the ticket, then the Sheet row + email to Jess
  3. POST /api/delivered { id, ok }  (fire and forget; marks the debug item sent or failed)
DynamoDB stream -> Lambda -> SNS -> anonymous alert to tumultywebservices@gmail.com (ID only)
```

text/plain keeps leg 2 a simple request (no CORS preflight). The web app answers with
`Access-Control-Allow-Origin: *`, so the browser can read `{ ok }` (tested 2026-11-20).

## The ticket (lib/submission/ticket.ts)

`ticket = <payload>.<signature>`

- `payload`: base64 web-safe **with padding** of the UTF-8 JSON
  `{ v: 1, id, formType, createdAt, exp, isTest, slot? }`. `exp` is ms since 1970.
  `slot` (bookings): `{ clinician, start, end, when, clinicianName }`, all checked by the Worker.
- `signature`: HMAC-SHA256 of the payload **string** with `TICKET_SECRET`, base64 web-safe with padding.

Apps Script check (the same as `verifyTicket`):

```
const [payload, sig] = body.ticket.split('.');
const secret = PropertiesService.getScriptProperties().getProperty('TICKET_SECRET');
const expected = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload, secret));
if (sig !== expected) -> { ok: false, error: 'bad ticket' }
const t = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(payload)).getDataAsString());
if (t.exp < Date.now()) -> { ok: false, error: 'ticket expired' }
1-time use: CacheService.getScriptCache() key 'ticket:' + t.id for 15 minutes; seen -> 'ticket used'
```

Then the script builds the same `body` as before: `id`, `formType` and `isTest` from the ticket,
`fields` from the request, and for a booking the **slot values from the ticket** (`start`, `end`,
`when`, `clinician`, `clinicianName`) over the form's. It keeps its own basic checks (name and email
present, lengths).

## Switching it on

| What | Where | Who |
|------|-------|-----|
| Turnstile widget for uptherapygroup.com | Cloudflare dashboard | Peter |
| `TURNSTILE_SITE_KEY` (public) | GitHub repo variable | Peter |
| `TURNSTILE_SECRET_KEY` | Worker secret | Peter |
| Apps Script web app (`doPost`, `doGet`) | Jess's Workspace | Peter |
| `APPS_SCRIPT_URL` (public) | GitHub repo variable **and** Worker secret (availability) | Peter |
| `APPS_SCRIPT_TOKEN` | Worker secret + script property `TOKEN` (availability `doGet` only) | Peter |
| `TICKET_SECRET` | Worker secret + script property `TICKET_SECRET`, the same value | Peter |
| Debug table, stream, Lambda, SNS, IAM user | unleashed-cms CDK stack | Peter |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `SUBMISSIONS_TABLE` | Worker secrets | Peter |

Make a secret with `openssl rand -base64 32`.

## Rules

- Client details (names, emails, phones, answers) go only to the Apps Script. Never to a Worker route.
- Never log a submission body. Logs carry the ID only.
- The debug log holds metadata only: ID, form type, time, spam result, test flag, delivery status.
- Fail open: a failed DynamoDB write never stops a submission. Until the table and keys are set, the write is skipped.
- Type `TEST` in any field to mark a test submission (the browser sets `isTest` in the ticket request).
- Client-facing email from the script uses `GmailApp`, not `MailApp` (MailApp mail to outside addresses bounced; UPTG-26).

## Booking availability

`GET /api/availability?clinician={slug}` returns the open consultation times (UTC). It takes the clinician's weekly hours from the CMS (`lib/scheduling/rules.ts`), asks the Apps Script `doGet` for busy times (`lib/scheduling/busy.ts`), and subtracts them (`lib/scheduling/slots.ts`). If the calendar can't be read, it returns 503 and no times. It never guesses.

Apps Script contract: `GET {APPS_SCRIPT_URL}?token=…&from=ISO&to=ISO` → `{ ok: true, busy: [{ start, end }] }`. Only start and end leave the script.

## Booking requests (formType `booking`)

`/book` step 2 asks for a ticket with `slot: { clinician, start }`. A time no longer open answers `409 { code: "SLOT_TAKEN" }` and nothing is sent. With a ticket, the browser sends the Apps Script:

`fields`: `clinician`, `start`, `format` (`video` | `phone`), `name`, `email`, `phone`, `pay` (`selfPay` | `insurance` | `unsure` | empty), `consent` (true). The script takes `end`, `when` and `clinicianName` from the ticket.

The script adds a `Booking` row (status `requested`) and emails Jess with Approve and Decline links (TWS-109).
