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

Forms today: `feedback` (/reviews/share). Next: `booking`.

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
- Fail open: a failed DynamoDB write never stops a submission.
- Type `TEST` in any field to mark a test submission.
