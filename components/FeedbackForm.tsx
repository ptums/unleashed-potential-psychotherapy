"use client";

import Link from "next/link";
import { useCallback, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ValidationError } from "yup";
import { CmsLinkTo } from "@/components/ui";
import { Turnstile } from "@/components/Turnstile";
import type { ShareYourExperience } from "@/lib/content";
import { feedbackSchema } from "@/lib/forms/schemas";
import { fillTokens } from "@/lib/tokens";

// The Share your experience form (/reviews/share). It posts to /api/submit, which checks it
// and hands it to the Apps Script (Sheet row + email to Jess). Until the Turnstile site key is
// set at build time (NEXT_PUBLIC_TURNSTILE_SITE_KEY), the form stays as before: the button does nothing.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type Status = "idle" | "sending" | "sent" | "failed";
type ErrorKey = "name" | "email";

const SEND_FAILED = "We couldn't send your feedback. Please try again.";

const field = "flex flex-col gap-1.5";
const label = "text-[16px] font-bold";
const input =
  "min-h-13 w-full border-[1.5px] border-forest bg-linen px-3.5 py-2.5 text-[17px] text-forest-dark aria-invalid:border-2 aria-invalid:border-error";
const textarea = `${input} min-h-30 resize-y leading-[1.6]`;
const option =
  "flex min-h-14 cursor-pointer items-center gap-3 border-[1.5px] border-forest px-4 py-2.5 leading-[1.3] has-checked:border-2 has-checked:border-forest-dark has-checked:bg-cream-light has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-forest-dark";
const control = "size-5 flex-none accent-forest-dark focus-visible:outline-none";

export function FeedbackForm({
  form,
  thankYou,
}: {
  form: ShareYourExperience["form"];
  thankYou: ShareYourExperience["thankYou"];
}) {
  const { labels } = form;
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ErrorKey[]>([]);
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const onToken = useCallback((t: string) => setToken(t), []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!SITE_KEY || status === "sending") {
      return;
    }
    const data = new FormData(event.currentTarget);
    const values = {
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      rating: data.get("rating") ?? "",
      likedBest: data.get("likedBest"),
      improve: data.get("improve"),
      recommend: data.get("recommend") ?? "",
      anythingElse: data.get("anythingElse"),
      publishConsent: data.get("publishConsent") === "on",
    };

    try {
      await feedbackSchema.validate(values, { abortEarly: false });
    } catch (err) {
      if (err instanceof ValidationError) {
        showErrors(err.inner.map((e) => e.path));
        return;
      }
      throw err;
    }

    setErrors([]);
    setStatus("sending");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "feedback", fields: { ...values, website: data.get("website") }, turnstileToken: token }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; invalid?: string[] } | null;
      if (res.status === 400 && body?.invalid) {
        setStatus("idle");
        showErrors(body.invalid);
        return;
      }
      if (!res.ok || !body?.ok) {
        throw new Error(`submit ${res.status}`);
      }
      setStatus("sent");
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch {
      setStatus("failed");
    } finally {
      // A Turnstile token works once, so render a fresh widget for a retry.
      setToken("");
      setResetKey((k) => k + 1);
    }
  }

  function showErrors(paths: (string | undefined)[]) {
    const keys = (["name", "email"] as const).filter((k) => paths.includes(k));
    setErrors(keys);
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  if (status === "sent" && !thankYou.hidden) {
    return (
      <section aria-live="polite" className="flex max-w-[640px] flex-col gap-6 nav:col-start-1 nav:row-start-1">
        <h1 ref={doneRef} tabIndex={-1} className="text-h2 focus:outline-none">
          {thankYou.heading}
        </h1>
        {thankYou.body && <p className="text-[19px]">{thankYou.body}</p>}
        <div className="flex flex-wrap items-center gap-6">
          <CmsLinkTo link={thankYou.primaryLink} className="btn" />
          <CmsLinkTo link={thankYou.secondaryLink} className="font-bold" />
        </div>
      </section>
    );
  }

  const required = <span className="font-normal text-forest">{labels.requiredMark}</span>;
  const errorText = (key: ErrorKey) => form.errors[key];
  const invalid = (key: ErrorKey) => errors.includes(key);
  const fieldError = (key: ErrorKey) =>
    invalid(key) ? (
      <p id={`fb-${key}-error`} className="text-[16px] font-bold text-error">
        {errorText(key)}
      </p>
    ) : null;
  const count = `${errors.length} ${errors.length === 1 ? "error" : "errors"}`;

  return (
    <section aria-labelledby="feedback-heading" className="flex max-w-[640px] flex-col gap-7 nav:col-start-1 nav:row-start-1">
      <div className="flex flex-col gap-2">
        <p className="eyebrow">{form.eyebrow}</p>
        <h1 id="feedback-heading" className="text-h2">
          {form.heading}
        </h1>
        {form.intro && <p>{form.intro}</p>}
      </div>
      {errors.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="border-2 border-error p-4 focus:outline-none">
          <p className="font-bold text-error">{fillTokens(form.errors.summary, { count })}</p>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
            {errors.map((key) => (
              <li key={key}>
                <a href={`#fb-${key}`}>{errorText(key)}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <form className="flex flex-col gap-7" noValidate onSubmit={onSubmit}>
        {/* Honeypot: hidden from people and screen readers. A bot that fills it is blocked. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="fb-website">Website</label>
          <input id="fb-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <Field id="fb-name" text={labels.name} extra={required} error={fieldError("name")}>
          <input
            id="fb-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={invalid("name") || undefined}
            aria-describedby={invalid("name") ? "fb-name-error" : undefined}
            className={input}
          />
        </Field>
        <Field id="fb-email" text={labels.email} extra={required} error={fieldError("email")}>
          <input
            id="fb-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={invalid("email") || undefined}
            aria-describedby={invalid("email") ? "fb-email-error" : undefined}
            className={input}
          />
        </Field>
        <Field id="fb-phone" text={labels.phone}>
          <input id="fb-phone" name="phone" type="tel" autoComplete="tel" className={input} />
        </Field>
        <RadioGroup
          legend={labels.ratingLegend}
          name="rating"
          options={[
            ["excellent", labels.ratingOptions.excellent],
            ["good", labels.ratingOptions.good],
            ["disappointing", labels.ratingOptions.disappointing],
          ]}
        />
        <Field id="fb-best" text={labels.likedBest}>
          <textarea id="fb-best" name="likedBest" className={textarea} />
        </Field>
        <Field id="fb-improve" text={labels.improve}>
          <textarea id="fb-improve" name="improve" className={textarea} />
        </Field>
        <RadioGroup
          legend={labels.recommendLegend}
          name="recommend"
          options={[
            ["yes", labels.recommendOptions.yes],
            ["no", labels.recommendOptions.no],
          ]}
        />
        <Field id="fb-more" text={labels.anythingElse}>
          <textarea id="fb-more" name="anythingElse" className={textarea} />
        </Field>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="publishConsent" className="mt-0.5 size-[22px] flex-none accent-forest-dark" />
          <span>{labels.publishConsent}</span>
        </label>
        {SITE_KEY && <Turnstile siteKey={SITE_KEY} onToken={onToken} resetKey={resetKey} />}
        {status === "failed" && (
          <p role="alert" className="font-bold text-error">
            {SEND_FAILED}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-6">
          <button type="submit" disabled={status === "sending"} className="btn min-h-13 px-8 disabled:cursor-wait disabled:opacity-60">
            {form.submitLabel}
          </button>
          <Link href="/reviews" className="text-[16px]">
            {form.cancelLabel}
          </Link>
        </div>
      </form>
    </section>
  );
}

function Field({
  id,
  text,
  extra,
  error,
  children,
}: {
  id: string;
  text: string;
  extra?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={field}>
      <label htmlFor={id} className={label}>
        {text} {extra}
      </label>
      {error}
      {children}
    </div>
  );
}

function RadioGroup({ legend, name, options }: { legend: string; name: string; options: [string, string][] }) {
  return (
    <fieldset className="m-0 flex flex-col border-0 p-0">
      <legend className="mb-3.5 p-0 font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map(([value, text]) => (
          <label key={value} className={option}>
            <input type="radio" name={name} value={value} className={control} />
            <span>{text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
