import type { ClinicianProfile } from "@/lib/content";
import type { SlotRules } from "./slots";

/** Free consultations are 15 minutes (the profile's booking subhead and the design). */
export const CONSULTATION_MINUTES = 15;

/**
 * The slot rules from a clinician's booking zone, with the schema defaults for anything not set.
 * No weekly hours means no open times.
 */
export function slotRulesFor(profile: ClinicianProfile): SlotRules {
  const b = profile.booking;
  return {
    timezone: b.timezone ?? "America/New_York",
    weeklyHours: b.weeklyHours ?? [],
    bufferMinutes: b.bufferMinutes ?? 15,
    minNoticeHours: b.minNoticeHours ?? 24,
    maxDaysAhead: b.maxDaysAhead ?? 28,
    durationMinutes: CONSULTATION_MINUTES,
  };
}
