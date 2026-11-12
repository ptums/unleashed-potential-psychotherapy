"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CmsLinkTo, CmsPicture, type CmsImage } from "@/components/ui";
import { DetailsStep, type DetailsValues, type SendResult } from "./DetailsStep";
import type { Booking } from "@/lib/content";
import { groupByDay, slotLabel, type SlotView } from "@/lib/scheduling/format";
import { fillTokens } from "@/lib/tokens";

// The /book flow (design-handoff/docs/BOOKING.md §2): 1 pick a time and a format,
// 2 the visitor's details and the request, 3 "Request sent". Jess approves each request by email (TWS-109).

export interface BookingClinician {
  slug: string;
  firstName: string;
  displayName: string;
  roleLine: string;
  portrait: CmsImage;
}

type Format = "video" | "phone";
type Load = { state: "loading" } | { state: "failed" } | { state: "ready"; timezone: string; slots: SlotView[] };

const FIRST_DAYS = 14;

const option =
  "flex min-h-14 cursor-pointer items-center gap-3 border-[1.5px] border-forest px-4 py-2.5 leading-[1.3] has-checked:border-2 has-checked:border-forest-dark has-checked:bg-cream-light has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-forest-dark";
const control = "size-5 flex-none accent-forest-dark focus-visible:outline-none";
const grid = "grid grid-cols-[repeat(auto-fill,minmax(min(170px,100%),1fr))] gap-2.5";

export function BookingFlow({ page, clinician }: { page: Booking; clinician: BookingClinician }) {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saved, setSaved] = useState<DetailsValues | null>(null);
  const [taken, setTaken] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [format, setFormat] = useState<Format>("video");
  const [showAll, setShowAll] = useState(false);
  const [slotError, setSlotError] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let live = true;
    fetch(`/api/availability?clinician=${encodeURIComponent(clinician.slug)}`)
      .then((res) => res.json())
      .then((data: { ok?: boolean; timezone?: string; slots?: SlotView[] }) => {
        if (!live) {
          return;
        }
        setLoad(data.ok && data.timezone && data.slots ? { state: "ready", timezone: data.timezone, slots: data.slots } : { state: "failed" });
      })
      .catch(() => live && setLoad({ state: "failed" }));
    return () => {
      live = false;
    };
  }, [clinician.slug, reloadKey]);

  const timezone = load.state === "ready" ? load.timezone : "America/New_York";
  const names = { firstName: clinician.firstName };
  const t = page.stepTime;
  const formatText = format === "video" ? t.videoLabel : t.phoneLabel;

  function goTo(next: 1 | 2 | 3) {
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function onContinue() {
    if (!slot) {
      setSlotError(true);
      return;
    }
    setSlotError(false);
    setTaken(false);
    goTo(2);
  }

  function onSent(result: SendResult) {
    if (result.kind === "taken") {
      // Someone else got that time: fresh times, nothing selected.
      setSlot(null);
      setTaken(true);
      setLoad({ state: "loading" });
      setReloadKey((k) => k + 1);
      goTo(1);
      return;
    }
    setSaved(result.values);
    goTo(3);
  }

  return (
    <div className="grid items-start gap-8 nav:grid-cols-[minmax(0,1fr)_380px] nav:gap-16">
      <Summary
        page={page}
        clinician={clinician}
        time={slot ? slotLabel(slot, timezone) : "Choose a time"}
        format={formatText}
        onChange={step === 2 ? () => goTo(1) : undefined}
      />
      <div className="flex flex-col gap-10 nav:col-start-1 nav:row-start-1">
        <Progress page={page} step={step} />
        {step === 1 && (
          <section aria-labelledby="step-heading" className="flex flex-col gap-9">
            <div className="flex flex-col gap-2">
              <h1 id="step-heading" ref={headingRef} tabIndex={-1} className="text-h2 focus:outline-none">
                {t.heading}
              </h1>
              {t.intro && <p>{t.intro}</p>}
            </div>
            {taken && (
              <p role="alert" className="border-2 border-error p-4 font-bold text-error">
                That time was just booked. Please choose another.
              </p>
            )}
            <fieldset className="m-0 flex flex-col border-0 p-0" aria-describedby={slotError ? "slot-error" : undefined}>
              <legend className="mb-3.5 p-0 font-bold">{fillTokens(t.slotsLegend, names)}</legend>
              {slotError && (
                <p id="slot-error" role="alert" className="mb-3 font-bold text-error">
                  Error: choose a time.
                </p>
              )}
              <Slots load={load} showAll={showAll} selected={slot} onPick={setSlot} onShowAll={() => setShowAll(true)} />
            </fieldset>
            <fieldset className="m-0 flex flex-col border-0 p-0">
              <legend className="mb-3.5 p-0 font-bold">{t.formatLegend}</legend>
              <div className={grid}>
                {(["video", "phone"] as const).map((f) => (
                  <label key={f} className={option}>
                    <input type="radio" name="format" value={f} checked={format === f} onChange={() => setFormat(f)} className={control} />
                    <span>{f === "video" ? t.videoLabel : t.phoneLabel}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <button type="button" onClick={onContinue} className="btn self-start">
              {t.continueLabel}
            </button>
          </section>
        )}
        {step === 2 && slot && (
          <DetailsStep
            page={page}
            request={{ clinician: clinician.slug, start: slot, format }}
            saved={saved}
            headingRef={headingRef}
            onBack={(values) => {
              setSaved(values);
              goTo(1);
            }}
            onDone={onSent}
          />
        )}
        {step === 3 && slot && (
          <RequestSent page={page} headingRef={headingRef} tokens={{ ...names, time: slotLabel(slot, timezone), format: formatText.toLowerCase(), email: saved?.email ?? "your email" }} />
        )}
      </div>
    </div>
  );
}

function Slots({
  load,
  showAll,
  selected,
  onPick,
  onShowAll,
}: {
  load: Load;
  showAll: boolean;
  selected: string | null;
  onPick: (start: string) => void;
  onShowAll: () => void;
}) {
  if (load.state === "loading") {
    return <p aria-live="polite">Loading open times…</p>;
  }
  if (load.state === "failed") {
    return <p role="alert">We couldn&rsquo;t load open times. Please try again in a few minutes.</p>;
  }
  const days = groupByDay(load.slots, load.timezone);
  if (days.length === 0) {
    return <p>No open times in the next few weeks. Please check back soon.</p>;
  }
  const shown = showAll ? days : days.slice(0, FIRST_DAYS);
  return (
    <div className="flex flex-col gap-6">
      {shown.map((day) => (
        <div key={day.key} className="flex flex-col gap-2.5">
          <p className="text-[16px] font-bold">{day.label}</p>
          <div className={grid}>
            {day.slots.map((s) => (
              <label key={s.start} className={option}>
                <input
                  type="radio"
                  name="slot"
                  value={s.start}
                  checked={selected === s.start}
                  onChange={() => onPick(s.start)}
                  className={control}
                />
                <span>{s.time}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      {!showAll && days.length > FIRST_DAYS && (
        <button type="button" onClick={onShowAll} className="self-start underline underline-offset-4">
          Show more times
        </button>
      )}
    </div>
  );
}

function Progress({ page, step }: { page: Booking; step: 1 | 2 | 3 }) {
  const labels = [page.stepTime.progressLabel, page.stepDetails.progressLabel, page.stepConfirmed.progressLabel];
  return (
    <div className="flex flex-col gap-5">
      <p className="eyebrow" aria-live="polite">
        Step {step} of 3
      </p>
      <ol aria-label="Booking progress" className="m-0 grid list-none grid-cols-3 gap-2 p-0">
        {labels.map((label, i) => {
          const n = i + 1;
          const reached = n <= step;
          return (
            <li
              key={label}
              aria-current={n === step ? "step" : undefined}
              className={`flex items-center gap-2.5 text-[15px] nav:text-[16px] ${
                reached ? "border-t-4 border-forest-dark pt-[9px]" : "border-t border-forest pt-3"
              } ${n === step ? "font-bold" : ""}`}
            >
              <span
                aria-hidden="true"
                className={`inline-flex size-7 flex-none items-center justify-center rounded-full border-[1.5px] border-forest-dark text-[14px] ${
                  reached ? "bg-forest-dark text-linen" : ""
                }`}
              >
                {n}
              </span>
              <span>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Summary({
  page,
  clinician,
  time,
  format,
  onChange,
}: {
  page: Booking;
  clinician: BookingClinician;
  time: string;
  format: string;
  onChange?: () => void;
}) {
  const s = page.summaryPanel;
  const row = (label: string, value: ReactNode, top = false) => (
    <div className={`flex justify-between gap-4 ${top ? "border-t border-forest pt-3" : ""}`}>
      <dt>{label}</dt>
      <dd className="m-0 text-right font-bold">{value}</dd>
    </div>
  );
  return (
    <aside aria-labelledby="summary-heading" className="flex flex-col gap-4.5 bg-cream-light p-7 nav:col-start-2 nav:row-start-1">
      <h2 id="summary-heading" className="eyebrow font-body font-bold text-forest-dark">
        {s.heading}
      </h2>
      <div className="flex items-center gap-4">
        <CmsPicture image={clinician.portrait} className="h-22 w-18 flex-none overflow-hidden" />
        <div className="flex flex-col gap-0.5">
          <Link href={`/clinicians/${clinician.slug}`} className="font-display text-[22px]">
            {clinician.displayName}
          </Link>
          <p className="text-[16px]">{clinician.roleLine}</p>
        </div>
      </div>
      <dl className="m-0 flex flex-col gap-3 border-t border-forest pt-4 text-[16px]">
        {row(s.rowLabels.session, "Consultation · 15 min")}
        {row(s.rowLabels.time, time)}
        {row(s.rowLabels.format, format)}
        {row(s.rowLabels.cost, "Free", true)}
      </dl>
      {onChange && (
        <button type="button" onClick={onChange} className="min-h-11 self-start underline underline-offset-4">
          {s.changeLabel}
        </button>
      )}
    </aside>
  );
}

function RequestSent({
  page,
  headingRef,
  tokens,
}: {
  page: Booking;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  tokens: Record<string, string>;
}) {
  const c = page.stepConfirmed;
  return (
    <section aria-labelledby="step-heading" aria-live="polite" className="flex max-w-[640px] flex-col gap-7">
      <div className="flex flex-col gap-3">
        <h1 id="step-heading" ref={headingRef} tabIndex={-1} className="text-h2 focus:outline-none">
          {c.heading}
        </h1>
        <p className="text-[19px]">{fillTokens(c.summary, tokens)}</p>
      </div>
      {c.nextSteps && c.nextSteps.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-[26px]">{c.nextStepsHeading}</h2>
          <ol className="m-0 flex list-decimal flex-col gap-2 pl-5">
            {c.nextSteps.map((step) => (
              <li key={step}>{fillTokens(step, tokens)}</li>
            ))}
          </ol>
        </div>
      )}
      <CmsLinkTo link={c.homeLink} className="btn self-start" />
    </section>
  );
}
