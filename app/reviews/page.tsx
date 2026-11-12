import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsHtml } from "@/components/CmsHtml";
import { ReviewText } from "@/components/ReviewText";
import { CmsLinkTo, CmsPicture } from "@/components/ui";
import { ClosingCta } from "@/components/zones";
import { getContent, isZoneVisible, type ClientReviews } from "@/lib/content";
import { seoMetadata } from "@/lib/seo";

async function loadPage() {
  return getContent().getPage("reviews");
}

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata((await loadPage())?.seo);
}

export default async function ReviewsPage() {
  const page = await loadPage();
  if (!page) {
    notFound();
  }

  return (
    <>
      <Hero zone={page.hero} />
      {isZoneVisible(page.featureImage) && <FeatureImage zone={page.featureImage} />}
      {isZoneVisible(page.reviewList) && <ReviewList zone={page.reviewList} />}
      {isZoneVisible(page.closingCta) && <ClosingCta zone={page.closingCta} />}
    </>
  );
}

function Hero({ zone }: { zone: ClientReviews["hero"] }) {
  return (
    <section className="pt-[clamp(64px,9vw,128px)] pb-[clamp(48px,6vw,80px)]">
      <div className="wrap mx-auto flex max-w-[920px] flex-col items-center gap-6 text-center">
        <p className="eyebrow">{zone.eyebrow}</p>
        <h1 className="text-h1">{zone.heading}</h1>
        <CmsHtml html={zone.intro} className="flex max-w-[34em] flex-col gap-4 text-[20px]" />
      </div>
    </section>
  );
}

function FeatureImage({ zone }: { zone: ClientReviews["featureImage"] }) {
  return (
    <div className="pb-[clamp(64px,8vw,112px)]">
      <div className="wrap">
        <CmsPicture image={zone.image} className="aspect-[21/9] w-full" />
      </div>
    </div>
  );
}

function ReviewList({ zone }: { zone: ClientReviews["reviewList"] }) {
  const items = zone.items.filter((item) => !item.hidden);
  return (
    <section aria-labelledby="reviews-heading" className="border-t border-forest py-[clamp(56px,8vw,112px)]">
      <div className="wrap flex flex-wrap items-start gap-x-24 gap-y-12">
        <div className="flex max-w-[360px] flex-[1_1_280px] flex-col gap-5 nav:sticky nav:top-8 max-nav:max-w-none">
          <p className="eyebrow">{zone.eyebrow}</p>
          <h2 id="reviews-heading" className="text-h2">
            {zone.heading}
          </h2>
          <p>{zone.summary.replaceAll("{count}", String(items.length))}</p>
          <CmsLinkTo link={zone.asideLink} className="btn min-h-11 self-start px-5 py-2.5" />
        </div>
        <ul className="m-0 min-w-0 flex-[999_1_520px] list-none border-b border-forest p-0">
          {items.map((item) => (
            <li key={`${item.displayName}-${item.text.slice(0, 24)}`}>
              <figure className="m-0 flex flex-col gap-4 border-t border-forest py-9">
                <ReviewText
                  text={item.text}
                  long={item.text.length > zone.collapseAfterChars}
                  expandLabel={zone.expandLabel}
                  collapseLabel={zone.collapseLabel}
                />
                <figcaption className="font-display text-[20px]">{item.displayName}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
