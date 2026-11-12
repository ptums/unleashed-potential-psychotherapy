import { TZDate } from "@date-fns/tz";

// Open consultation times (design-handoff/docs/BOOKING.md §3). Pure: the busy times come in,
// the open times go out. Wall-clock hours are read in the clinician's time zone with
// @date-fns/tz, so daylight saving changes never shift them.

export type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface HoursWindow {
  day: Day;
  start: string; // "HH:MM", 24-hour, in the clinician's time zone
  end: string;
}

export interface Interval {
  start: Date;
  end: Date;
}

export interface SlotRules {
  timezone: string;
  weeklyHours: HoursWindow[];
  bufferMinutes: number;
  minNoticeHours: number;
  maxDaysAhead: number;
  durationMinutes: number;
}

const DAYS: Day[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const STEP_MINUTES = 15;
const MINUTE = 60_000;

function wallTime(day: TZDate, hhmm: string, timezone: string): TZDate {
  const [h, m] = hhmm.split(":").map(Number);
  return new TZDate(day.getFullYear(), day.getMonth(), day.getDate(), h, m, timezone);
}

function overlaps(a: Interval, b: Interval): boolean {
  return a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime();
}

/** Every open start from now to maxDaysAhead, sorted, as UTC intervals. */
export function openSlots(rules: SlotRules, busy: Interval[], now: Date): Interval[] {
  const { timezone, weeklyHours, bufferMinutes, minNoticeHours, maxDaysAhead, durationMinutes } = rules;
  const earliest = now.getTime() + minNoticeHours * 60 * MINUTE;
  const today = new TZDate(now.getTime(), timezone);
  const slots: Interval[] = [];

  for (let offset = 0; offset <= maxDaysAhead; offset++) {
    const day = new TZDate(today.getFullYear(), today.getMonth(), today.getDate() + offset, 12, 0, timezone);
    const dayKey = DAYS[day.getDay()];

    for (const window of weeklyHours) {
      if (window.day !== dayKey) {
        continue;
      }
      const windowStart = wallTime(day, window.start, timezone);
      const windowEnd = wallTime(day, window.end, timezone);

      // Candidates start on :00, :15, :30 or :45.
      const startMinute = windowStart.getMinutes();
      const aligned = Math.ceil(startMinute / STEP_MINUTES) * STEP_MINUTES;
      let start = windowStart.getTime() + (aligned - startMinute) * MINUTE;

      for (; start + durationMinutes * MINUTE <= windowEnd.getTime(); start += STEP_MINUTES * MINUTE) {
        if (start < earliest) {
          continue;
        }
        const slot = { start: new Date(start), end: new Date(start + durationMinutes * MINUTE) };
        const padded = {
          start: new Date(start - bufferMinutes * MINUTE),
          end: new Date(slot.end.getTime() + bufferMinutes * MINUTE),
        };
        if (busy.some((b) => overlaps(padded, b))) {
          continue;
        }
        slots.push(slot);
      }
    }
  }

  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
}
