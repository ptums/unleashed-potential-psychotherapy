// Ported from jessrebelo.com (lib/submission/turnstile.ts there).
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type SpamResult = "passed" | "blocked" | "unchecked";

/**
 * Asks Cloudflare if the token is real. If Cloudflare can't answer, the result is
 * "unchecked" and the submission still goes through (fail open).
 */
export async function verifyTurnstile(token: unknown, ip: string | null): Promise<SpamResult> {
  if (typeof token !== "string" || !token) {
    console.warn("Turnstile blocked: no token");
    return "blocked";
  }
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY as string,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    // Log Cloudflare's reason, so `wrangler tail` shows why in 1 request.
    if (!data.success) {
      console.warn("Turnstile blocked", data["error-codes"]);
    }
    return data.success ? "passed" : "blocked";
  } catch (err) {
    console.error("verifyTurnstile failed", err);
    return "unchecked";
  }
}
