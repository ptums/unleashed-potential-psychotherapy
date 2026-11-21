import type { FormType } from "@/lib/forms/schemas";

// Submission tickets (UPTG-38, compliance finding 2). Client details must not pass through the
// Cloudflare Worker, so a submission has 2 legs:
//   1. The browser asks /api/ticket for a ticket. The Worker sees no names, emails or phone numbers:
//      only the form type, the Turnstile token and, for a booking, the clinician and the start time.
//      It runs the rate limit, the spam check and the slot check, then signs a ticket.
//   2. The browser posts the details with the ticket straight to the Apps Script (covered by the
//      Google Workspace BAA). The script checks the signature, the expiry and 1-time use.
//
// Format, chosen so Apps Script can check it with Utilities alone:
//   ticket  = <payload>.<signature>
//   payload = base64 web-safe WITH padding of the UTF-8 JSON (Utilities.base64EncodeWebSafe)
//   signature = HMAC-SHA256(payload string, TICKET_SECRET), base64 web-safe with padding
//               (Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload, secret)))

/** How long a ticket stays valid: long enough to finish the form after the spam check. */
export const TICKET_TTL_MS = 10 * 60 * 1000;

export interface TicketSlot {
  clinician: string;
  start: string;
  end: string;
  when: string;
  clinicianName: string;
}

export interface TicketPayload {
  v: 1;
  id: string;
  formType: FormType;
  createdAt: string;
  /** Expiry, in ms since 1970. */
  exp: number;
  isTest: boolean;
  /** Bookings only: the checked time. The script uses these values, not the ones in the form. */
  slot?: TicketSlot;
}

const encoder = new TextEncoder();

function base64WebSafe(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_");
}

function fromBase64WebSafe(text: string): Uint8Array {
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function hmac(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64WebSafe(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message))));
}

export async function signTicket(payload: TicketPayload, secret: string): Promise<string> {
  const body = base64WebSafe(encoder.encode(JSON.stringify(payload)));
  return `${body}.${await hmac(body, secret)}`;
}

/** The same check the Apps Script does. Used in tests, to prove the 2 sides agree. */
export async function verifyTicket(ticket: string, secret: string, now = Date.now()): Promise<TicketPayload | null> {
  const [body, signature] = ticket.split(".");
  if (!body || !signature || (await hmac(body, secret)) !== signature) {
    return null;
  }
  const payload = JSON.parse(new TextDecoder().decode(fromBase64WebSafe(body))) as TicketPayload;
  return payload.exp > now ? payload : null;
}
