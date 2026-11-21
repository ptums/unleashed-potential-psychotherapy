import { ValidationError } from "yup";
import { bookingSchema, isFormType } from "@/lib/forms/schemas";
import { checkSlot } from "@/lib/scheduling/check";
import { isRateLimited } from "@/lib/submission/rate-limit";
import { putSubmission } from "@/lib/submission/store";
import { TICKET_TTL_MS, signTicket, type TicketPayload } from "@/lib/submission/ticket";
import { verifyTurnstile } from "@/lib/submission/turnstile";

// POST /api/ticket: leg 1 of a form submission (lib/submission/ticket.ts, UPTG-38).
// This route never receives client details. It reads only:
//   { formType, turnstileToken, website (honeypot), isTest, slot?: { clinician, start } }
// and answers { ok, id, ticket }. The browser then posts the details with the ticket straight to
// the Apps Script. Logs carry the ID only.

const slotSchema = bookingSchema.pick(["clinician", "start"]);

export async function POST(request: Request) {
  const ip = request.headers.get("cf-connecting-ip");
  if (await isRateLimited(ip)) {
    return Response.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const formType: unknown = body?.formType;
  if (!isFormType(formType)) {
    return Response.json({ ok: false, error: "Unknown form" }, { status: 400 });
  }

  const secret = process.env.TICKET_SECRET;
  if (!secret) {
    console.error("ticket: TICKET_SECRET is not set");
    return Response.json({ ok: false, error: "Not configured" }, { status: 503 });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const isTest = body.isTest === true;
  const record = (spamResult: "passed" | "blocked" | "unchecked") =>
    putSubmission({ id, formType, createdAt, spamResult, isTest }).catch((err) => console.error("putSubmission failed", id, err));

  // A bot filled the hidden field. Answer "ok" with no ticket, so it learns nothing.
  if (body.website) {
    await record("blocked");
    return Response.json({ ok: true, id, ticket: null });
  }

  const spamResult = await verifyTurnstile(body.turnstileToken, ip);
  if (spamResult === "blocked") {
    await record("blocked");
    return Response.json({ ok: false, error: "Verification failed" }, { status: 403 });
  }

  // A booking: the time must still be open on a fresh calendar read.
  let slot: TicketPayload["slot"];
  if (formType === "booking") {
    let wanted: { clinician: string; start: string };
    try {
      wanted = await slotSchema.validate(body.slot, { abortEarly: false, stripUnknown: true });
    } catch (err) {
      if (err instanceof ValidationError) {
        return Response.json({ ok: false, invalid: [...new Set(err.inner.map((e) => e.path).filter(Boolean))] }, { status: 400 });
      }
      throw err;
    }
    const check = await checkSlot(wanted.clinician, wanted.start);
    if (check.status === "unknown") {
      return Response.json({ ok: false, invalid: ["clinician"] }, { status: 400 });
    }
    if (check.status === "taken") {
      return Response.json({ ok: false, code: "SLOT_TAKEN" }, { status: 409 });
    }
    if (check.status === "unavailable") {
      return Response.json({ ok: false, error: "Calendar unavailable" }, { status: 503 });
    }
    slot = { clinician: wanted.clinician, start: wanted.start, end: check.end, when: check.when, clinicianName: check.clinicianName };
  }

  await record(spamResult);
  const ticket = await signTicket({ v: 1, id, formType, createdAt, exp: Date.now() + TICKET_TTL_MS, isTest, slot }, secret);
  return Response.json({ ok: true, id, ticket });
}
