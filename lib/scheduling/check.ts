import { getContent } from "@/lib/content";
import { fetchBusy } from "./busy";
import { slotLabel } from "./format";
import { slotRulesFor } from "./rules";
import { openSlots } from "./slots";

export type SlotCheck =
  | { status: "open"; end: string; when: string; clinicianName: string }
  | { status: "taken" }
  | { status: "unavailable" } // the calendar can't be read
  | { status: "unknown" }; // no such clinician, or not taking bookings

const DAY = 24 * 60 * 60 * 1000;

/**
 * Is this start still open? Recomputed from a fresh calendar read on every request, so a time
 * taken since the visitor loaded the page is caught here (BOOKING.md §3, "Check the time").
 */
export async function checkSlot(slug: string, start: string, now = new Date()): Promise<SlotCheck> {
  const profile = await getContent().getEntry("clinicians", slug);
  if (!profile || profile.booking.hidden || !profile.booking.acceptingNewClients) {
    return { status: "unknown" };
  }
  const rules = slotRulesFor(profile);
  const busy = await fetchBusy(now, new Date(now.getTime() + (rules.maxDaysAhead + 1) * DAY));
  if (!busy) {
    return { status: "unavailable" };
  }
  const wanted = new Date(start).getTime();
  const slot = openSlots(rules, busy, now).find((s) => s.start.getTime() === wanted);
  if (!slot) {
    return { status: "taken" };
  }
  return {
    status: "open",
    end: slot.end.toISOString(),
    when: slotLabel(slot.start.toISOString(), rules.timezone),
    clinicianName: profile.profileHeader.displayName,
  };
}
