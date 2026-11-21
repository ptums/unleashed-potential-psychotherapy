import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsHtml } from "@/components/CmsHtml";
import { CmsLinkTo, CmsPicture, SectionIntro } from "@/components/ui";
import { ClosingCta, sectionPad } from "@/components/zones";
import { getContent, isZoneVisible, type OurApproach } from "@/lib/content";
import { seoMetadata } from "@/lib/seo";

async function loadPage() {
  return getContent().getPage("our-approach");
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadPage();
  return seoMetadata(page?.seo, { path: "/our-approach", image: page?.featureImage.image });
}

export default async function OurApproachPage() {
  const page = await loadPage();
  if (!page) {
    notFound();
  }

  return (
    <>
      {isZoneVisible(page.hero) && (
        <Hero zone={page.hero} image={isZoneVisible(page.featureImage) ? page.featureImage.image : undefined} />
      )}
      {isZoneVisible(page.values) && <Values zone={page.values} />}
      {isZoneVisible(page.standardOfCare) && <StandardOfCare zone={page.standardOfCare} />}
      {isZoneVisible(page.founderNote) && <FounderNote zone={page.founderNote} />}
      {isZoneVisible(page.closingCta) && <ClosingCta zone={page.closingCta} />}
    </>
  );
}

// Laid out like the Home hero: the title and intro on the left, the feature image on the right
// (Jess and Peter, 2026-11-19). On a phone the text comes first and the image follows.
function Hero({ zone, image }: { zone: OurApproach["hero"]; image?: OurApproach["featureImage"]["image"] }) {
  return (
    <section className="py-[clamp(56px,8vw,112px)]">
      <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-center gap-[clamp(40px,6vw,96px)]">
        <div className="flex flex-col gap-7">
          <p className="eyebrow">{zone.eyebrow}</p>
          <h1 className="text-h1">{zone.heading}</h1>
          {zone.intro && <CmsHtml html={zone.intro} className="max-w-[30em] text-lead [&_p+p]:mt-4" />}
        </div>
        {image && <CmsPicture image={image} className="aspect-[4/5] w-full" eager />}
      </div>
    </section>
  );
}

function Values({ zone }: { zone: OurApproach["values"] }) {
  return (
    <section aria-labelledby="values-heading" className="border-t border-forest py-[clamp(56px,8vw,112px)]">
      <div className="wrap flex flex-col gap-12">
        <SectionIntro id="values-heading" eyebrow={zone.eyebrow} heading={zone.heading} />
        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-x-12 gap-y-10">
          {zone.items.map((item) => (
            <div key={item.title} className="flex flex-col gap-2">
              <dt className="font-display text-2xl">{item.title}</dt>
              <dd className="m-0">{item.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function StandardOfCare({ zone }: { zone: OurApproach["standardOfCare"] }) {
  return (
    <section aria-labelledby="standard-heading" className={`bg-cream-light ${sectionPad}`}>
      <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(min(400px,100%),1fr))] gap-12">
        <SectionIntro id="standard-heading" eyebrow={zone.eyebrow} heading={zone.heading} />
        <ul className="m-0 flex list-none flex-col border-b border-forest p-0">
          {zone.items.map((item) => (
            <li key={item.title} className="border-t border-forest py-5">
              <strong>{item.title}</strong> {item.body}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FounderNote({ zone }: { zone: OurApproach["founderNote"] }) {
  return (
    <section aria-labelledby="founder-heading" className={sectionPad}>
      <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(min(360px,100%),1fr))] items-center gap-[clamp(40px,6vw,96px)]">
        <CmsPicture image={zone.portrait} className="aspect-[4/5] w-full max-w-[460px]" />
        <figure className="m-0 flex flex-col gap-6">
          <h2 id="founder-heading" className="eyebrow font-body font-bold">
            {zone.eyebrow}
          </h2>
          <blockquote className="m-0 font-display text-[clamp(24px,2.6vw,34px)] leading-[1.35] italic">
            <CmsHtml
              html={zone.quote}
              className="[&_p+p]:mt-4 [&>:first-child]:before:content-['“'] [&>:last-child]:after:content-['”']"
            />
          </blockquote>
          <figcaption>
            <strong>{zone.authorName}</strong>
            {zone.authorRole && (
              <>
                <br />
                {zone.authorRole}
              </>
            )}
          </figcaption>
          <CmsLinkTo link={zone.profileLink} className="self-start font-bold" />
        </figure>
      </div>
    </section>
  );
}
