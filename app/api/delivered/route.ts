import { isRateLimited } from "@/lib/submission/rate-limit";
import { markDelivered } from "@/lib/submission/store";

// POST /api/delivered: after leg 2, the browser reports whether the Apps Script took the submission,
// so the debug log keeps its sent/failed status. Body: { id, ok }. No client details.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  if (await isRateLimited(request.headers.get("cf-connecting-ip"))) {
    return Response.json({ ok: false }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  if (typeof body?.id !== "string" || !UUID.test(body.id) || typeof body.ok !== "boolean") {
    return Response.json({ ok: false }, { status: 400 });
  }
  // The record may be missing (the log is fail-open), so a failed update is not an error here.
  await markDelivered(body.id, body.ok ? "sent" : "failed").catch((err) => console.error("markDelivered failed", body.id, err));
  return Response.json({ ok: true });
}
