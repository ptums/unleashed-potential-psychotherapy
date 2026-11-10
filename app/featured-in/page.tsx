import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsLinkTo, CmsPicture, SectionIntro } from "@/components/ui";
import { getContent, isZoneVisible, type FeaturedIn } from "@/lib/content";
import { getMediaAppearance, type MediaAppearance } from "@/lib/media";
import { seoMetadata } from "@/lib/seo";

async function loadPage() {
  return getContent().getPage("featured-in");
}

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata((await loadPage())?.seo);
}

const resolve = (refs: { id: string }[]) =>
  refs.map((ref) => getMediaAppearance(ref.id)).filter((a): a is MediaAppearance => a !== null);

export default async function FeaturedInPage() {
  const page = await loadPage();
  if (!page) {
    notFound();
  }
  const appearances = isZoneVisible(page.appearances) ? resolve(page.appearances.items) : [];

  return (
    <>
      {isZoneVisible(page.hero) && <Hero zone={page.hero} outlets={appearances.map((a) => a.outlet)} />}
      {isZoneVisible(page.featuredEpisode) && <FeaturedEpisode zone={page.featuredEpisode} />}
      {isZoneVisible(page.appearances) && appearances.length > 0 && (
        <Appearances zone={page.appearances} appearances={appearances} />
      )}
      {isZoneVisible(page.pressCta) && <PressCta zone={page.pressCta} />}
    </>
  );
}

function Hero({ zone, outlets }: { zone: FeaturedIn["hero"]; outlets: string[] }) {
  return (
    <section className="pt-[clamp(64px,9vw,128px)] pb-[clamp(48px,6vw,80px)]">
      <div className="wrap mx-auto flex max-w-[920px] flex-col items-center gap-6 text-center">
        <p className="eyebrow">{zone.eyebrow}</p>
        <h1 className="text-h1">{zone.heading}</h1>
        {zone.intro && <p className="max-w-[32em] text-[20px]">{zone.intro}</p>}
        {outlets.length > 0 && (
          <ul
            aria-label="Featured in"
            className="m-0 mt-4 flex list-none flex-wrap justify-center gap-x-10 gap-y-3 p-0 font-display text-[21px] italic"
          >
            {outlets.map((outlet) => (
              <li key={outlet}>{outlet}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ListenLinks({ appearance }: { appearance: MediaAppearance }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
      {appearance.links.map((link) => (
        <li key={link.url}>
          <a href={link.url} className="btn min-h-11 px-5 py-2.5 text-label">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function FeaturedEpisode({ zone }: { zone: FeaturedIn["featuredEpisode"] }) {
  const appearance = getMediaAppearance(zone.appearance.id);
  if (!appearance) {
    return null;
  }

  return (
    <section aria-labelledby="featured-heading" className="bg-cream-light py-[clamp(56px,8vw,112px)]">
      <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-center gap-[clamp(40px,6vw,80px)]">
        {zone.image && <CmsPicture image={zone.image} className="aspect-video w-full" />}
        <div className="flex flex-col gap-5">
          <p className="eyebrow">
            {zone.eyebrow} · {appearance.outlet}
          </p>
          <h2 id="featured-heading" className="text-[clamp(30px,3.4vw,46px)]">
            {appearance.title}
          </h2>
          {zone.summary && <p>{zone.summary}</p>}
          {appearance.links.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <p className="text-small font-bold">{zone.listenLabel}</p>
              <ListenLinks appearance={appearance} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Appearances({ zone, appearances }: { zone: FeaturedIn["appearances"]; appearances: MediaAppearance[] }) {
  return (
    <section aria-labelledby="appearances-heading" className="wrap py-[clamp(64px,8vw,112px)]">
      <div className="mb-10">
        <SectionIntro id="appearances-heading" eyebrow={zone.eyebrow} heading={zone.heading} />
      </div>
      <div className="border-b border-forest">
        {appearances.map((a) => (
          <article key={a.id} className="flex flex-wrap gap-x-14 gap-y-6 border-t border-forest py-10">
            <div className="flex flex-[0_1_260px] flex-col gap-1.5">
              <p className="eyebrow">{a.kind}</p>
              <p className="font-display text-2xl">{a.outlet}</p>
            </div>
            <div className="flex flex-[1_1_420px] flex-col gap-3.5">
              <h3 className="text-[26px]">{a.title}</h3>
              <p>{a.summary}</p>
              {a.links.length > 0 && <ListenLinks appearance={a} />}
              {a.parts && (
                <ul className="m-0 flex flex-col gap-1.5 pl-5">
                  {a.parts.map((part) => (
                    <li key={part.label}>{part.url ? <a href={part.url}>{part.label}</a> : part.label}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PressCta({ zone }: { zone: FeaturedIn["pressCta"] }) {
  return (
    <section aria-labelledby="press-heading" className="dark py-[clamp(64px,8vw,112px)]">
      <div className="wrap flex flex-wrap items-center justify-between gap-8">
        <div className="flex flex-col gap-2">
          <h2 id="press-heading" className="text-h2-band">
            {zone.heading}
          </h2>
          {zone.body && (
            <p>
              {zone.body}
              {zone.email && (
                <>
                  {" "}
                  <a href={`mailto:${zone.email}`}>{zone.email}</a>
                </>
              )}
              .
            </p>
          )}
        </div>
        <CmsLinkTo link={zone.cta} className="btn" />
      </div>
    </section>
  );
}
