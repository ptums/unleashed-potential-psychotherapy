# Forms

Ported from jessrebelo.com (`app/api/submit`, `lib/submission`). Plan: TWS-108 (intake) and TWS-109 (approve to book).

## Flow

```
Browser form (honeypot + Turnstile)
  -> POST /api/submit { formType, fields, turnstileToken }
Server (app/api/submit/route.ts)
  1. Rate limit (SUBMIT_LIMITER: 3 per IP per minute)
  2. Honeypot, then Turnstile
  3. Validate with the shared schema (lib/forms/schemas.ts)
  4. Debug log: 1 DynamoDB item, metadata only (fail open)
  5. Apps Script: Sheet row with a timestamp + email to Jess
  6. Mark the debug item sent or failed
DynamoDB stream -> Lambda -> SNS -> anonymous alert to tumultywebservices@gmail.com (ID only)
```

Forms today: `review` (/reviews/share). Next: `booking`.

## Switching it on

The forms stay inert until all of these exist. Nothing here goes in the repo.

| What | Where | Who |
|------|-------|-----|
| Turnstile widget for uptherapygroup.com | Cloudflare dashboard | Peter |
| `TURNSTILE_SITE_KEY` (public) | GitHub repo variable | Peter |
| `TURNSTILE_SECRET_KEY` | Worker secret | Peter |
| Apps Script web app (`doPost`) | Jess's Workspace | Peter |
| `APPS_SCRIPT_URL`, `APPS_SCRIPT_TOKEN` | Worker secrets | Peter |
| Debug table, stream, Lambda, SNS, IAM user | unleashed-cms CDK stack | Peter |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `SUBMISSIONS_TABLE` | Worker secrets | Peter |

Worker secrets: `npx wrangler secret put <NAME>` from the repo root (Worker `unleashed-potential-psychotherapy`).

## Rules

- Never log a submission body. Logs carry the ID only.
- The debug log holds metadata only: ID, form type, time, spam result, test flag, delivery status.
- Fail open: a failed DynamoDB write never stops a submission. Until the table and keys are set, the write is skipped.
- The Apps Script web app answers with a 302 that only accepts GET. `lib/submission/apps-script.ts` follows it by hand; a re-sent POST gets a 405 HTML page.
- Type `TEST` in any field to mark a test submission.

## Booking availability

`GET /api/availability?clinician={slug}` returns the open consultation times (UTC). It takes the clinician's weekly hours from the CMS (`lib/scheduling/rules.ts`), asks the Apps Script `doGet` for busy times (`lib/scheduling/busy.ts`), and subtracts them (`lib/scheduling/slots.ts`). If the calendar can't be read, it returns 503 and no times. It never guesses.

Apps Script contract: `GET {APPS_SCRIPT_URL}?token=…&from=ISO&to=ISO` → `{ ok: true, busy: [{ start, end }] }`. Only start and end leave the script.

## Booking requests (formType `booking`)

`/book` step 2 posts to `/api/submit`. After validation, the route checks the time against a fresh calendar read: a time no longer open answers `409 { code: "SLOT_TAKEN" }` and nothing is sent. An open time goes to the Apps Script with:

`fields`: `clinician`, `start`, `end` (ISO, UTC), `when` ("Tue, Nov 3 at 12:00 PM ET"), `clinicianName`, `format` (`video` | `phone`), `name`, `email`, `phone`, `pay` (`selfPay` | `insurance` | `unsure` | empty), `consent` (true).

The script adds a `Booking` row (status `requested`) and emails Jess with Approve and Decline links (TWS-109).
