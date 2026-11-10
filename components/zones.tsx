import { CmsLinkTo } from "./ui";
import type { CmsLink } from "@/lib/links";

export const sectionPad = "py-[clamp(72px,9vw,128px)]";

/** The dark closing band most pages end with: a heading and one button. */
export function ClosingCta({ zone }: { zone: { heading: string; cta: CmsLink } }) {
  return (
    <section aria-labelledby="closing-heading" className="dark py-[clamp(64px,8vw,112px)]">
      <div className="wrap flex flex-wrap items-center justify-between gap-8">
        <h2 id="closing-heading" className="text-h2-band">
          {zone.heading}
        </h2>
        <CmsLinkTo link={zone.cta} className="btn" />
      </div>
    </section>
  );
}
