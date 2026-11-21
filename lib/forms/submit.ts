import type { FormType } from "./schemas";

// Browser side of a form submission (UPTG-38): 2 legs, so client details never pass through the
// Cloudflare Worker. See lib/submission/ticket.ts for the design.
//   1. POST /api/ticket with no client details: spam check, rate limit, slot check, signed ticket.
//   2. POST the details with the ticket straight to the Apps Script web app (Google Workspace BAA).
//      text/plain keeps it a "simple" request, so the browser sends no CORS preflight; the web app
//      answers with Access-Control-Allow-Origin: *, so the reply can be read.
// Then a 3rd, fire-and-forget call tells /api/delivered whether it worked (ID only).

/** The Apps Script web app URL, set at build time (repo variable APPS_SCRIPT_URL). */
const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ?? "";

// A visitor or Peter types TEST in any field to mark a test. Tests stay out of the counts.
export const isTestSubmission = (fields: object) =>
  Object.values(fields).some((v) => typeof v === "string" && /\bTEST\b/.test(v));

export type SubmitResult =
  | { kind: "sent" }
  | { kind: "taken" } // bookings: the time is gone
  | { kind: "invalid"; invalid: string[] };

export async function submitForm(args: {
  formType: FormType;
  fields: Record<string, unknown>;
  turnstileToken: string;
  /** The honeypot field. A person leaves it empty. */
  website: unknown;
  /** Bookings only. */
  slot?: { clinician: string; start: string };
}): Promise<SubmitResult> {
  // Leg 1: the ticket. Only the form type, the spam token, the honeypot and the slot go to the Worker.
  const ticketRes = await fetch("/api/ticket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      formType: args.formType,
      turnstileToken: args.turnstileToken,
      website: args.website,
      isTest: isTestSubmission(args.fields),
      slot: args.slot,
    }),
  });
  const ticketBody = (await ticketRes.json().catch(() => null)) as
    | { ok?: boolean; id?: string; ticket?: string | null; code?: string; invalid?: string[] }
    | null;
  if (ticketRes.status === 409 && ticketBody?.code === "SLOT_TAKEN") {
    return { kind: "taken" };
  }
  if (ticketRes.status === 400 && ticketBody?.invalid) {
    return { kind: "invalid", invalid: ticketBody.invalid };
  }
  if (!ticketRes.ok || !ticketBody?.ok || !ticketBody.id) {
    throw new Error(`ticket ${ticketRes.status}`);
  }
  // The honeypot was filled: the Worker gives no ticket, and the bot sees a normal success.
  if (!ticketBody.ticket) {
    return { kind: "sent" };
  }

  // Leg 2: the details go straight to the Apps Script, never to the Worker.
  if (!APPS_SCRIPT_URL) {
    throw new Error("NEXT_PUBLIC_APPS_SCRIPT_URL is not set");
  }
  let ok = false;
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ticket: ticketBody.ticket, fields: args.fields }),
    });
    const body = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    ok = res.ok && body?.ok === true;
  } finally {
    // Leg 3: the debug log's sent/failed status. Fire and forget; the ID is all it carries.
    void fetch("/api/delivered", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ticketBody.id, ok }),
      keepalive: true,
    }).catch(() => undefined);
  }
  if (!ok) {
    throw new Error("apps script refused the submission");
  }
  return { kind: "sent" };
}
