"use client";

import { useCallback, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { ValidationError } from "yup";
import { Turnstile } from "@/components/Turnstile";
import type { Booking } from "@/lib/content";
import { bookingSchema } from "@/lib/forms/schemas";
import { fillTokens } from "@/lib/tokens";

// Step 2 of /book: the visitor's details, then the request through /api/submit (formType "booking").
// The server checks the time again. A taken time sends the visitor back to step 1.

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const ERROR_KEYS = ["name", "email", "phone", "consent"] as const;
type ErrorKey = (typeof ERROR_KEYS)[number];

export interface DetailsValues {
  name: string;
  email: string;
  phone: string;
  pay: string;
}

export type SendResult = { kind: "sent"; values: DetailsValues } | { kind: "taken" };

const input =
  "min-h-13 w-full border-[1.5px] border-forest bg-linen px-3.5 py-2.5 text-[17px] text-forest-dark aria-invalid:border-2 aria-invalid:border-error";
const option =
  "flex min-h-14 cursor-pointer items-center gap-3 border-[1.5px] border-forest px-4 py-2.5 leading-[1.3] has-checked:border-2 has-checked:border-forest-dark has-checked:bg-cream-light has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-forest-dark";

export function DetailsStep({
  page,
  request,
  saved,
  headingRef,
  onBack,
  onDone,
}: {
  page: Booking;
  request: { clinician: string; start: string; format: "video" | "phone" };
  saved: DetailsValues | null;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBack: (values: DetailsValues) => void;
  onDone: (result: SendResult) => void;
}) {
  const d = page.stepDetails;
  const [errors, setErrors] = useState<ErrorKey[]>([]);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const onToken = useCallback((t: string) => setToken(t), []);

  function read(form: HTMLFormElement) {
    const data = new FormData(form);
    const text = (k: string) => String(data.get(k) ?? "");
    return {
      values: { name: text("name"), email: text("email"), phone: text("phone"), pay: text("pay") },
      consent: data.get("consent") === "on",
      website: text("website"),
    };
  }

  function showErrors(paths: (string | undefined)[]) {
    setErrors(ERROR_KEYS.filter((k) => paths.includes(k)));
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) {
      return;
    }
    const { values, consent, website } = read(event.currentTarget);
    const fields = { ...request, ...values, consent };
    try {
      await bookingSchema.validate(fields, { abortEarly: false });
    } catch (err) {
      if (err instanceof ValidationError) {
        showErrors(err.inner.map((e) => e.path));
        return;
      }
      throw err;
    }

    setErrors([]);
    setFailed(false);
    setSending(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "booking", fields: { ...fields, website }, turnstileToken: token }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; code?: string; invalid?: string[] } | null;
      if (res.status === 409 && body?.code === "SLOT_TAKEN") {
        onDone({ kind: "taken" });
        return;
      }
      if (res.status === 400 && body?.invalid) {
        showErrors(body.invalid);
        return;
      }
      if (!res.ok || !body?.ok) {
        throw new Error(`submit ${res.status}`);
      }
      onDone({ kind: "sent", values });
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
      setToken("");
      setResetKey((k) => k + 1);
    }
  }

  const invalid = (k: ErrorKey) => errors.includes(k);
  const errorText = (k: ErrorKey) => d.errors[k];
  const describe = (k: ErrorKey, hint?: string) =>
    [hint, invalid(k) ? `bk-${k}-error` : undefined].filter(Boolean).join(" ") || undefined;
  const fieldError = (k: ErrorKey) =>
    invalid(k) ? (
      <p id={`bk-${k}-error`} className="text-[16px] font-bold text-error">
        {errorText(k)}
      </p>
    ) : null;
  const count = `${errors.length} ${errors.length === 1 ? "error" : "errors"}`;

  return (
    <section aria-labelledby="step-heading" className="flex max-w-[640px] flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 id="step-heading" ref={headingRef} tabIndex={-1} className="text-h2 focus:outline-none">
          {d.heading}
        </h1>
        {d.intro && <p>{d.intro}</p>}
      </div>
      {errors.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="border-2 border-error p-4 focus:outline-none">
          <p className="font-bold text-error">{fillTokens(d.errors.summary, { count })}</p>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
            {errors.map((k) => (
              <li key={k}>
                <a href={`#bk-${k}`}>{errorText(k)}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <form ref={formRef} className="flex flex-col gap-7" noValidate onSubmit={onSubmit}>
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="bk-website">Website</label>
          <input id="bk-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <Field id="bk-name" label={d.nameLabel} error={fieldError("name")}>
          <input id="bk-name" name="name" type="text" autoComplete="name" defaultValue={saved?.name} required
            aria-invalid={invalid("name") || undefined} aria-describedby={describe("name")} className={input} />
        </Field>
        <Field id="bk-email" label={d.emailLabel} hint={d.emailHint} error={fieldError("email")}>
          <input id="bk-email" name="email" type="email" autoComplete="email" defaultValue={saved?.email} required
            aria-invalid={invalid("email") || undefined} aria-describedby={describe("email", d.emailHint ? "bk-email-hint" : undefined)}
            className={input} />
        </Field>
        <Field id="bk-phone" label={d.phoneLabel} error={fieldError("phone")}>
          <input id="bk-phone" name="phone" type="tel" autoComplete="tel" defaultValue={saved?.phone} required
            aria-invalid={invalid("phone") || undefined} aria-describedby={describe("phone")} className={input} />
        </Field>
        <fieldset className="m-0 flex flex-col border-0 p-0">
          <legend className="mb-3.5 p-0 font-bold">{d.payLegend}</legend>
          <div className="flex flex-wrap gap-2.5">
            {(["selfPay", "insurance", "unsure"] as const).map((key) => (
              <label key={key} className={option}>
                <input type="radio" name="pay" value={key} defaultChecked={saved?.pay === key}
                  className="size-5 flex-none accent-forest-dark focus-visible:outline-none" />
                <span>{d.payOptions[key]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-col gap-1.5">
          {fieldError("consent")}
          <label className="flex cursor-pointer items-start gap-3">
            <input id="bk-consent" type="checkbox" name="consent" aria-invalid={invalid("consent") || undefined}
              aria-describedby={describe("consent")} className="mt-0.5 size-[22px] flex-none accent-forest-dark" />
            <span>{d.consentText}</span>
          </label>
        </div>
        {SITE_KEY && <Turnstile siteKey={SITE_KEY} onToken={onToken} resetKey={resetKey} />}
        {failed && (
          <p role="alert" className="font-bold text-error">
            We couldn&rsquo;t send your request. Please try again in a few minutes.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-6">
          <button type="submit" disabled={sending} aria-busy={sending}
            className="btn min-h-13 px-8 disabled:cursor-wait disabled:opacity-60">
            {d.submitLabel}
          </button>
          <button type="button" onClick={() => formRef.current && onBack(read(formRef.current).values)}
            className="min-h-11 underline underline-offset-4">
            {d.backLabel}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[16px] font-bold">
        {label}
      </label>
      {hint && (
        <span id={`${id}-hint`} className="text-[16px] text-forest">
          {hint}
        </span>
      )}
      {error}
      {children}
    </div>
  );
}
