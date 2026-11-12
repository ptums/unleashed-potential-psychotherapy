import { getContent } from "@/lib/content";
import { fetchBusy } from "@/lib/scheduling/busy";
import { slotRulesFor } from "@/lib/scheduling/rules";
import { openSlots } from "@/lib/scheduling/slots";

// GET /api/availability?clinician={slug} → { ok: true, timezone, slots: [{ start, end }] } (UTC).
// Open consultation times for 1 clinician: their weekly hours minus their calendar's busy times.

const DAY = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("clinician") ?? "";
  const profile = slug ? await getContent().getEntry("clinicians", slug) : null;
  if (!profile) {
    return Response.json({ ok: false, error: "Unknown clinician" }, { status: 404 });
  }
  if (profile.booking.hidden || !profile.booking.acceptingNewClients) {
    return Response.json({ ok: false, error: "Not taking bookings" }, { status: 409 });
  }

  const rules = slotRulesFor(profile);
  const now = new Date();
  const until = new Date(now.getTime() + (rules.maxDaysAhead + 1) * DAY);

  const busy = await fetchBusy(now, until);
  if (!busy) {
    // Never guess: without the calendar, no time is shown as open.
    return Response.json({ ok: false, error: "Calendar unavailable" }, { status: 503 });
  }

  const slots = openSlots(rules, busy, now).map((s) => ({ start: s.start.toISOString(), end: s.end.toISOString() }));
  return Response.json(
    { ok: true, timezone: rules.timezone, slots },
    { headers: { "Cache-Control": "no-store" } },
  );
}
