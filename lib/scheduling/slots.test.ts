import { describe, expect, it } from "vitest";
import { openSlots, type SlotRules } from "./slots";

const rules: SlotRules = {
  timezone: "America/New_York",
  weeklyHours: [{ day: "tue", start: "09:00", end: "10:00" }],
  bufferMinutes: 0,
  minNoticeHours: 0,
  maxDaysAhead: 7,
  durationMinutes: 15,
};

const iso = (slots: { start: Date }[]) => slots.map((s) => s.start.toISOString());
// Monday Nov 2, 2026, noon ET: the day after US daylight saving time ends (Nov 1).
const mondayAfterDst = new Date("2026-11-02T17:00:00Z");

describe("openSlots", () => {
  it("splits a window into 15-minute starts that fit inside it", () => {
    expect(iso(openSlots(rules, [], mondayAfterDst))).toEqual([
      "2026-11-03T14:00:00.000Z",
      "2026-11-03T14:15:00.000Z",
      "2026-11-03T14:30:00.000Z",
      "2026-11-03T14:45:00.000Z",
    ]);
  });

  it("keeps wall-clock hours across the daylight saving change", () => {
    // Tuesday Oct 27 is before the change: 9:00 ET is 13:00 UTC, not 14:00.
    const before = openSlots({ ...rules, maxDaysAhead: 8 }, [], new Date("2026-10-26T17:00:00Z"));
    expect(before[0].start.toISOString()).toBe("2026-10-27T13:00:00.000Z");
    expect(before.find((s) => s.start.toISOString().startsWith("2026-11-03"))?.start.toISOString()).toBe(
      "2026-11-03T14:00:00.000Z",
    );
  });

  it("drops starts inside the minimum notice", () => {
    const now = new Date("2026-11-03T13:20:00Z"); // 8:20 ET on the Tuesday
    expect(iso(openSlots({ ...rules, minNoticeHours: 1, maxDaysAhead: 0 }, [], now))).toEqual([
      "2026-11-03T14:30:00.000Z",
      "2026-11-03T14:45:00.000Z",
    ]);
  });

  it("drops starts that touch a busy block or its buffer", () => {
    const busy = [{ start: new Date("2026-11-03T14:30:00Z"), end: new Date("2026-11-03T14:45:00Z") }];
    expect(iso(openSlots(rules, busy, mondayAfterDst))).toEqual([
      "2026-11-03T14:00:00.000Z",
      "2026-11-03T14:15:00.000Z",
      "2026-11-03T14:45:00.000Z",
    ]);
    expect(iso(openSlots({ ...rules, bufferMinutes: 15 }, busy, mondayAfterDst))).toEqual(["2026-11-03T14:00:00.000Z"]);
  });

  it("gives nothing for a window shorter than a slot", () => {
    const short = { ...rules, weeklyHours: [{ day: "tue" as const, start: "09:00", end: "09:10" }] };
    expect(openSlots(short, [], mondayAfterDst)).toEqual([]);
  });

  it("aligns an odd window start to the next quarter hour", () => {
    const odd = { ...rules, weeklyHours: [{ day: "tue" as const, start: "09:05", end: "09:45" }] };
    expect(iso(openSlots(odd, [], mondayAfterDst))).toEqual(["2026-11-03T14:15:00.000Z", "2026-11-03T14:30:00.000Z"]);
  });

  it("returns days in order and stops at maxDaysAhead", () => {
    const twoDays = {
      ...rules,
      maxDaysAhead: 14,
      weeklyHours: [
        { day: "wed" as const, start: "12:00", end: "12:15" },
        { day: "tue" as const, start: "09:00", end: "09:15" },
      ],
    };
    expect(iso(openSlots(twoDays, [], mondayAfterDst))).toEqual([
      "2026-11-03T14:00:00.000Z",
      "2026-11-04T17:00:00.000Z",
      "2026-11-10T14:00:00.000Z",
      "2026-11-11T17:00:00.000Z",
    ]); // Tuesday Nov 17 is day 15, past maxDaysAhead
  });
});
