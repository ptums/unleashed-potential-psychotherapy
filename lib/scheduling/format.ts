// Labels for open times, in the clinician's time zone (the visitor may be elsewhere).

export interface SlotView {
  start: string; // ISO, UTC
  end: string;
}

export interface DayGroup {
  key: string; // yyyy-mm-dd in the clinician's time zone
  label: string; // "Tue, Nov 3"
  slots: (SlotView & { time: string })[]; // time: "9:15 AM"
}

function parts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const key = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const label = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric" }).format(d);
  const time = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(d);
  return { key, label, time };
}

/** Open times grouped by day, in order. */
export function groupByDay(slots: SlotView[], timeZone: string): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const slot of slots) {
    const { key, label, time } = parts(slot.start, timeZone);
    let group = groups.at(-1);
    if (!group || group.key !== key) {
      group = { key, label, slots: [] };
      groups.push(group);
    }
    group.slots.push({ ...slot, time });
  }
  return groups;
}

/** "Tue, Nov 3 at 9:15 AM ET" for the summary and the request. */
export function slotLabel(iso: string, timeZone: string): string {
  const { label, time } = parts(iso, timeZone);
  const zone = timeZone === "America/New_York" ? "ET" : timeZone;
  return `${label} at ${time} ${zone}`;
}
