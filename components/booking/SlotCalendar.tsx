"use client";

import { useState } from "react";
import type { DayGroup } from "@/lib/scheduling/format";

// The time picker on /book: a month calendar where days with open times can be picked, and that
// day's times beside it. Day keys are yyyy-mm-dd in the clinician's time zone, so the calendar math
// below uses plain UTC dates and never shifts a day.

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const parseKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m: m - 1, d };
};
const keyOf = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const monthIndex = (key: string) => {
  const { y, m } = parseKey(key);
  return y * 12 + m;
};
const fullDate = (key: string) => {
  const { y, m, d } = parseKey(key);
  return `${WEEKDAY_NAMES[new Date(Date.UTC(y, m, d)).getUTCDay()]}, ${MONTHS[m]} ${d}`;
};

const option =
  "relative flex min-h-12 cursor-pointer items-center justify-center border-[1.5px] border-forest px-3 py-2 text-center leading-[1.3] transition-colors duration-150 hover:bg-cream-light has-checked:border-2 has-checked:border-forest-dark has-checked:bg-forest-dark has-checked:text-linen has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-forest-dark";

export function SlotCalendar({
  days,
  selected,
  onPick,
}: {
  days: DayGroup[];
  selected: string | null;
  onPick: (start: string) => void;
}) {
  const byKey = new Map(days.map((d) => [d.key, d]));
  const selectedDay = days.find((d) => d.slots.some((s) => s.start === selected))?.key;
  const [dayKey, setDayKey] = useState(selectedDay ?? days[0].key);
  const [month, setMonth] = useState(monthIndex(dayKey));

  const first = monthIndex(days[0].key);
  const last = monthIndex(days[days.length - 1].key);
  const y = Math.floor(month / 12);
  const m = month % 12;
  const lead = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const length = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length }, (_, i) => keyOf(y, m, i + 1))];

  const day = byKey.get(dayKey);

  return (
    <div className="grid items-start gap-8 nav:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMonth(month - 1)}
            disabled={month <= first}
            aria-label="Previous month"
            className="flex size-11 cursor-pointer items-center justify-center transition-opacity disabled:cursor-default disabled:opacity-30"
          >
            <Chevron direction="left" />
          </button>
          <p aria-live="polite" className="font-display text-[22px]">
            {MONTHS[m]} {y}
          </p>
          <button
            type="button"
            onClick={() => setMonth(month + 1)}
            disabled={month >= last}
            aria-label="Next month"
            className="flex size-11 cursor-pointer items-center justify-center transition-opacity disabled:cursor-default disabled:opacity-30"
          >
            <Chevron direction="right" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center" key={month}>
          {WEEKDAYS.map((w) => (
            <span key={w} aria-hidden="true" className="pb-1 text-[13px] font-bold tracking-[0.06em] text-forest uppercase">
              {w}
            </span>
          ))}
          {cells.map((key, i) => {
            if (!key) {
              return <span key={`blank-${i}`} />;
            }
            const open = byKey.get(key);
            const isSelected = key === dayKey;
            const n = parseKey(key).d;
            if (!open) {
              return (
                <span key={key} aria-hidden="true" className="flex aspect-square items-center justify-center text-[16px] text-forest">
                  {n}
                </span>
              );
            }
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDayKey(key)}
                aria-pressed={isSelected}
                aria-label={`${fullDate(key)}, ${open.slots.length} open ${open.slots.length === 1 ? "time" : "times"}`}
                className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-full text-[16px] font-bold transition-[background-color,color,transform] duration-200 ease-out motion-safe:hover:scale-105 ${
                  isSelected ? "bg-forest-dark text-linen" : "bg-cream-light hover:bg-cream"
                }`}
              >
                {n}
                {!isSelected && <span aria-hidden="true" className="absolute bottom-1.5 size-1 rounded-full bg-forest-dark" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {day && (
          <div key={day.key} className="flex flex-col gap-4 motion-safe:animate-[motion-fade_220ms_ease-out,motion-rise_260ms_ease-out]">
            <p className="text-[18px] font-bold">{fullDate(day.key)}</p>
            {/* Morning (AM) and afternoon (PM) side by side, in the clinician's time zone. A day with
                only 1 part uses the full width for it. */}
            <div className="grid grid-cols-2 gap-4">
            {(
              [
                ["Morning", day.slots.filter((t) => t.time.endsWith("AM"))],
                ["Afternoon", day.slots.filter((t) => t.time.endsWith("PM"))],
              ] as const
            )
              .filter(([, times]) => times.length > 0)
              .map(([part, times], _i, parts) => (
                <div key={part} role="group" aria-label={part} className={`flex flex-col gap-2 ${parts.length === 1 ? "col-span-2" : ""}`}>
                  <p aria-hidden="true" className="eyebrow">
                    {part}
                  </p>
                  <div className={`grid gap-2 ${parts.length === 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                    {times.map((s) => (
                      <label key={s.start} className={option}>
                        <input
                          type="radio"
                          name="slot"
                          value={s.start}
                          checked={selected === s.start}
                          onChange={() => onPick(s.start)}
                          className="absolute inset-0 m-0 cursor-pointer opacity-0"
                        />
                        <span>{s.time}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      {direction === "left" ? <path d="M12 4l-6 6 6 6" /> : <path d="M8 4l6 6-6 6" />}
    </svg>
  );
}
