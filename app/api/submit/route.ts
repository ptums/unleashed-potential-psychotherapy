import { ValidationError } from "yup";
import { formSchemas, isFormType, type FormValues } from "@/lib/forms/schemas";
import { sendToAppsScript } from "@/lib/submission/apps-script";
import { checkSlot } from "@/lib/scheduling/check";
import { isRateLimited } from "@/lib/submission/rate-limit";
import { markDelivered, putSubmission } from "@/lib/submission/store";
import { verifyTurnstile } from "@/lib/submission/turnstile";

// Ported from jessrebelo.com (app/api/submit/route.ts there). The one change: the checked
// submission goes to the Apps Script (Sheet row + email to Jess) in place of SendGrid.
// Submission bodies are never logged. Logs carry the ID only.

// A visitor or Peter types TEST to mark a test. Tests stay out of the counts.
const isTestSubmission = (fields: object) =>
  Object.values(fields).some((v) => typeof v === "string" && /\bTEST\b/.test(v));

export async function POST(request: Request) {
  const ip = request.headers.get("cf-connecting-ip");
  if (await isRateLimited(ip)) {
    return Response.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  // 1. Read the body. Reject anything that is not a known form.
  const body = await request.json().catch(() => null);
  const formType: unknown = body?.formType;
  if (!isFormType(formType)) {
    return Response.json({ ok: false, error: "Unknown form" }, { status: 400 });
  }

  const recordBlocked = async () => {
    const id = crypto.randomUUID();
    await putSubmission({ id, formType, createdAt: new Date().toISOString(), spamResult: "blocked", isTest: false }).catch(
      (err) => console.error("putSubmission failed", id, err),
    );
    return id;
  };

  // 2. Honeypot: a bot filled the hidden field. Answer "ok" so it learns nothing.
  if (body.fields?.website) {
    return Response.json({ ok: true, id: await recordBlocked() });
  }

  const spamResult = await verifyTurnstile(body.turnstileToken, ip);
  if (spamResult === "blocked") {
    await recordBlocked();
    return Response.json({ ok: false, error: "Verification failed" }, { status: 403 });
  }

  // 3. Validate on the server with the same schema the browser uses.
  let fields: FormValues[typeof formType];
  try {
    fields = await formSchemas[formType].validate(body.fields, { abortEarly: false, stripUnknown: true });
  } catch (err) {
    if (err instanceof ValidationError) {
      const invalid = [...new Set(err.inner.map((e) => e.path).filter(Boolean))];
      return Response.json({ ok: false, invalid }, { status: 400 });
    }
    throw err;
  }

  // 3b. A booking: the time must still be open on a fresh calendar read.
  let extra: Record<string, string> = {};
  if (formType === "booking") {
    const booking = fields as FormValues["booking"];
    const slot = await checkSlot(booking.clinician, booking.start);
    if (slot.status === "unknown") {
      return Response.json({ ok: false, invalid: ["clinician"] }, { status: 400 });
    }
    if (slot.status === "taken") {
      return Response.json({ ok: false, code: "SLOT_TAKEN" }, { status: 409 });
    }
    if (slot.status === "unavailable") {
      return Response.json({ ok: false, error: "Calendar unavailable" }, { status: 503 });
    }
    extra = { end: slot.end, when: slot.when, clinicianName: slot.clinicianName };
  }

  // 4. The ID and the metadata-only record (the debug log).
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const isTest = isTestSubmission(fields);

  // Fail open: losing a record is OK, losing a client's submission is not.
  let stored = true;
  try {
    await putSubmission({ id, formType, createdAt, spamResult, isTest });
  } catch (err) {
    stored = false;
    console.error("putSubmission failed", id, err);
  }

  // 5. Hand it to the Apps Script: Sheet row and email to Jess.
  const sent = await sendToAppsScript({ formType, id, createdAt, isTest, fields: { ...fields, ...extra } });

  // 6. Write the result back to the record (only if the record exists).
  if (stored) {
    await markDelivered(id, sent.ok ? "sent" : "failed").catch((err) => console.error("markDelivered failed", id, err));
  }

  return Response.json({ ok: sent.ok, id }, { status: sent.ok ? 200 : 502 });
}
