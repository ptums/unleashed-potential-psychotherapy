import { getCloudflareContext } from "@opennextjs/cloudflare";

// Ported from jessrebelo.com (lib/submission/rate-limit.ts there). The SUBMIT_LIMITER
// binding is in wrangler.jsonc: 3 submissions per IP per minute.

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export async function isRateLimited(ip: string | null): Promise<boolean> {
  if (!ip) {
    return false;
  }
  try {
    const limiter = (getCloudflareContext().env as unknown as { SUBMIT_LIMITER?: RateLimiter }).SUBMIT_LIMITER;
    if (!limiter) {
      return false;
    }
    const { success } = await limiter.limit({ key: `submit:${ip}` });
    return !success;
  } catch (err) {
    // Fail open: if the limiter breaks, Turnstile still guards the form.
    console.error("isRateLimited failed", err);
    return false;
  }
}
