import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsHtml } from "@/components/CmsHtml";
import { CmsLinkTo, CmsPicture } from "@/components/ui";
import { ClosingCta } from "@/components/zones";
import { getContent, isZoneVisible, type WhatToExpect } from "@/lib/content";
import { seoMetadata } from "@/lib/seo";

async function loadPage() {
  return getContent().getPage("what-to-expect");
}

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata((await loadPage())?.seo);
}

export default async function WhatToExpectPage() {
  const page = await loadPage();
  if (!page) {
    notFound();
  }

  return (
    <>
      {isZoneVisible(page.hero) && <Hero zone={page.hero} />}
      {isZoneVisible(page.steps) && <Steps zone={page.steps} />}
      {isZoneVisible(page.formats) && <Formats zone={page.formats} />}
      {isZoneVisible(page.closingCta) && <ClosingCta zone={page.closingCta} />}
    </>
  );
}

function Hero({ zone }: { zone: WhatToExpect["hero"] }) {
  return (
    <section className="pt-[clamp(64px,9vw,128px)] pb-[clamp(40px,5vw,64px)]">
      <div className="wrap mx-auto flex max-w-[920px] flex-col items-center gap-6 text-center">
        <p className="eyebrow">{zone.eyebrow}</p>
        <h1 className="text-h1">{zone.heading}</h1>
        {zone.intro && <CmsHtml html={zone.intro} className="flex max-w-[32em] flex-col gap-4 text-[20px]" />}
      </div>
    </section>
  );
}

function Steps({ zone }: { zone: WhatToExpect["steps"] }) {
  const total = zone.items.length;
  return (
    <section aria-label="Steps" className="wrap pb-[clamp(64px,8vw,112px)]">
      <ol className="m-0 list-none border-b border-forest p-0">
        {zone.items.map((step, i) => (
          <li key={step.title} className="flex flex-wrap gap-x-16 gap-y-6 border-t border-forest py-12">
            <span aria-hidden="true" className="flex-[0_0_120px] font-display text-5xl leading-none nav:text-[64px]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-[1_1_420px] flex-col gap-3.5">
              <p className="eyebrow">
                Step {i + 1} of {total}
              </p>
              <h2 className="text-[clamp(28px,3vw,40px)]">{step.title}</h2>
              <CmsHtml html={step.body} className="[&_p+p]:mt-3" />
              {step.facts && step.facts.length > 0 && (
                <dl className="mt-2 mb-0 flex flex-wrap gap-x-10 gap-y-3 text-small">
                  {step.facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="font-bold">{fact.label}</dt>
                      <dd className="m-0">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Formats({ zone }: { zone: WhatToExpect["formats"] }) {
  return (
    <section aria-labelledby="formats-heading" className="bg-cream-light py-[clamp(64px,8vw,112px)]">
      <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(min(360px,100%),1fr))] items-center gap-[clamp(40px,6vw,96px)]">
        {zone.image && <CmsPicture image={zone.image} className="aspect-[4/3] w-full" />}
        <div className="flex flex-col gap-5">
          <p className="eyebrow">{zone.eyebrow}</p>
          <h2 id="formats-heading" className="text-h2-band">
            {zone.heading}
          </h2>
          {zone.body && <CmsHtml html={zone.body} className="[&_p+p]:mt-4" />}
          <CmsLinkTo link={zone.link} className="self-start font-bold" />
        </div>
      </div>
    </section>
  );
}
