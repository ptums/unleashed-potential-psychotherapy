import { CmsLinkTo } from "./ui";
import type { CmsLink } from "@/lib/links";

export const sectionPad = "py-[clamp(72px,9vw,128px)]";

/** Questions and answers as native disclosures (keyboard and screen reader support built in). */
export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="border-b border-forest">
      {items.map((item) => (
        <details key={item.question} className="group border-t border-forest">
          <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-4 py-3 font-display text-[22px]">
            {item.question}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              aria-hidden="true"
              className="flex-none transition-transform group-open:rotate-45"
            >
              <path d="M9 3v12M3 9h12" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </summary>
          <div className="max-w-[46em] pb-6">
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

/** The dark closing band most pages end with: a heading and one button. */
export function ClosingCta({ zone }: { zone: { heading: string; body?: string; cta: CmsLink } }) {
  return (
    <section aria-labelledby="closing-heading" className="dark py-[clamp(64px,8vw,112px)]">
      <div className="wrap flex flex-wrap items-center justify-between gap-8">
        <div className="flex flex-col gap-2">
          <h2 id="closing-heading" className="text-h2-band">
            {zone.heading}
          </h2>
          {zone.body && <p>{zone.body}</p>}
        </div>
        <CmsLinkTo link={zone.cta} className="btn" />
      </div>
    </section>
  );
}
