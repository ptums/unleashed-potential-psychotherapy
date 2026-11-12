import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsLinkTo, CmsPicture, SectionIntro } from "@/components/ui";
import { getContent, isZoneVisible, type ClinicianProfile, type Home, type Reference, type SpecialtyTile } from "@/lib/content";
import { hrefForReference } from "@/lib/links";
import { resolveClinicians, specialtyNames } from "@/lib/content/clinicians";
import { seoMetadata } from "@/lib/seo";
import { sectionPad } from "@/components/zones";
import { CmsHtml } from "@/components/CmsHtml";
import type { Metadata } from "next";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { truncateWords } from "@/lib/text";

async function loadHome() {
  return getContent().getPage("home");
}

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata((await loadHome())?.seo);
}

export default async function HomePage() {
  const home = await loadHome();
  if (!home) {
    notFound();
  }

  return (
    <>
      {isZoneVisible(home.hero) && <Hero zone={home.hero} />}
      {isZoneVisible(home.featuredIn) && <FeaturedIn zone={home.featuredIn} />}
      {isZoneVisible(home.specialties) && <Specialties zone={home.specialties} />}
      {isZoneVisible(home.clinicians) && <Clinicians zone={home.clinicians} />}
      {isZoneVisible(home.howItWorks) && <HowItWorks zone={home.howItWorks} />}
      {/* The review carousel replaces the Our approach band (Peter, 2026-11-12). */}
      <ReviewsBand />
    </>
  );
}

function Hero({ zone }: { zone: Home["hero"] }) {
  return (
    <section className="py-[clamp(56px,8vw,112px)]">
      <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-center gap-[clamp(40px,6vw,96px)]">
        <div className="flex flex-col gap-7">
          <p className="eyebrow">{zone.eyebrow}</p>
          <h1 className="text-h1">{zone.heading}</h1>
          {zone.body && <CmsHtml html={zone.body} className="max-w-[30em] text-lead [&_p+p]:mt-4" />}
          <div className="mt-2 flex flex-wrap items-center gap-6">
            <CmsLinkTo link={zone.primaryCta} className="btn" />
            <CmsLinkTo link={zone.secondaryLink} className="font-bold" />
          </div>
          {zone.trustLine && zone.trustLine.length > 0 && (
            <p className="text-small text-forest">{zone.trustLine.join(" · ")}</p>
          )}
        </div>
        <CmsPicture image={zone.image} className="aspect-[4/5] w-full" eager />
      </div>
    </section>
  );
}

function FeaturedIn({ zone }: { zone: NonNullable<Home["featuredIn"]> }) {
  // Each outlet shows as plain text, as the editor typed it. The strip has no links.
  const outlets = [...new Set(zone.appearances.map((ref) => ref.id.trim()).filter((name) => name !== ""))];
  if (outlets.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="featured-heading" className="border-y border-forest py-8">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
        <h2 id="featured-heading" className="eyebrow font-body font-bold">
          {zone.label}
        </h2>
        <ul className="m-0 flex list-none flex-wrap gap-x-12 gap-y-3 p-0 font-display text-[21px] italic">
          {outlets.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <CmsLinkTo link={zone.allLink} className="font-bold" />
      </div>
    </section>
  );
}

async function Specialties({ zone }: { zone: NonNullable<Home["specialties"]> }) {
  const tiles = (await Promise.all(zone.items.map(toTile))).filter((t): t is Tile => t !== null);
  if (tiles.length === 0) {
    return null;
  }

  const tileClass = "flex min-h-[200px] flex-col gap-2.5 border border-forest p-8 no-underline";

  return (
    <section id="specialties" aria-labelledby="specialties-heading" className={sectionPad}>
      <div className="wrap flex flex-col gap-12">
        <SectionIntro id="specialties-heading" eyebrow={zone.eyebrow} heading={zone.heading} />
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-6 p-0">
          {tiles.map((tile, i) => (
            <li key={`${i}-${tile.title}`} className="flex">
              {tile.href ? (
                <Link href={tile.href} className={`${tileClass} w-full transition-colors hover:bg-cream-light`}>
                  <h3 className="text-h3">{tile.title}</h3>
                  <p>{tile.body}</p>
                  <span className="mt-auto text-[15px] font-bold underline underline-offset-4">
                    {zone.tileLinkLabel}
                  </span>
                </Link>
              ) : (
                <div className={`${tileClass} w-full`}>
                  <h3 className="text-h3">{tile.title}</h3>
                  <p>{tile.body}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

interface Tile {
  title: string;
  body: string;
  href: string | null;
}

type SpecialtyItem = NonNullable<Home["specialties"]>["items"][number];

/**
 * 1 tile from a specialties item: title, sub text, and the Learn more link when the item has a page.
 * Home pages published before this schema hold a specialty reference instead ({ collection, id }).
 * Those still render from the specialty entry until the item is re-entered in the CMS.
 */
async function toTile(item: SpecialtyItem | Reference): Promise<Tile | null> {
  if ("title" in item) {
    return { title: item.title, body: item.body, href: item.page ? hrefForReference(item.page) : null };
  }
  const tile: SpecialtyTile | null = await getContent().getSpecialtyTile(item.id);
  if (!tile) {
    return null;
  }
  return { title: tile.name, body: tile.summary, href: tile.hasPage ? `/specialties/${tile.slug}` : null };
}

async function Clinicians({ zone }: { zone: NonNullable<Home["clinicians"]> }) {
  const clinicians = await resolveClinicians(getContent(), {
    mode: zone.mode,
    refs: zone.clinicians,
    limit: zone.limit,
  });

  const recruiting = zone.recruitingCard && !zone.recruitingCard.hidden ? zone.recruitingCard : null;
  if (clinicians.length === 0 && !recruiting) {
    return null;
  }

  return (
    <section id="clinicians" aria-labelledby="clinicians-heading" className={`bg-cream-light ${sectionPad}`}>
      <div className="wrap flex flex-col gap-12">
        <SectionIntro id="clinicians-heading" eyebrow={zone.eyebrow} heading={zone.heading} intro={zone.intro} />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(480px,100%),1fr))] items-stretch gap-6">
          {clinicians.map(({ slug, profile }) => (
            <ClinicianCard key={slug} slug={slug} profile={profile} ctaLabel={zone.cardCtaLabel} />
          ))}
          {recruiting && (
            <div className="flex flex-col justify-center gap-4 border border-forest p-8">
              <h3 className="text-h3">{recruiting.heading}</h3>
              {recruiting.body && <p>{recruiting.body}</p>}
              <CmsLinkTo link={recruiting.link} className="font-bold" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

async function ClinicianCard({
  slug,
  profile,
  ctaLabel,
}: {
  slug: string;
  profile: ClinicianProfile;
  ctaLabel: string;
}) {
  const header = profile.profileHeader;
  const names = await specialtyNames(getContent(), profile);

  return (
    <article className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-8 bg-linen p-8">
      <CmsPicture image={header.portrait} className="aspect-[3/4] w-full" />
      <div className="flex flex-col gap-3">
        <h3 className="text-[30px]">{header.displayName}</h3>
        <p className="text-small">{header.roleLine}</p>
        {names.length > 0 && <p className="text-small">{names.join(" · ")}</p>}
        <Link href={`/clinicians/${slug}`} className="btn mt-auto self-start px-5 py-2.5 text-label min-h-11">
          {ctaLabel}
          <span className="sr-only">: {header.displayName}</span>
        </Link>
      </div>
    </article>
  );
}

function HowItWorks({ zone }: { zone: NonNullable<Home["howItWorks"]> }) {
  return (
    <section aria-labelledby="how-heading" className={sectionPad}>
      <div className="wrap flex flex-col gap-12">
        <SectionIntro id="how-heading" eyebrow={zone.eyebrow} heading={zone.heading} />
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-10 p-0">
          {zone.steps.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-3 border-t border-forest pt-6">
              <span aria-hidden="true" className="font-display text-[40px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-2xl">{step.title}</h3>
              <CmsHtml html={step.body} className="[&_p+p]:mt-3" />
            </li>
          ))}
        </ol>
        <CmsLinkTo link={zone.moreLink} className="self-start font-bold" />
      </div>
    </section>
  );
}

/** Client reviews from the Reviews page, 1 at a time, each cut to 200 words. */
async function ReviewsBand() {
  const reviews = await getContent().getPage("reviews");
  const items = (reviews?.reviewList.items ?? [])
    .filter((item) => !item.hidden)
    .map((item) => ({ displayName: item.displayName, text: truncateWords(item.text, 200) }));
  if (items.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby="reviews-band-heading" className={`dark ${sectionPad}`}>
      <div className="wrap flex max-w-[960px] flex-col items-center gap-10">
        <h2 id="reviews-band-heading" className="eyebrow font-body font-bold">
          Client reviews
        </h2>
        <ReviewCarousel reviews={items} />
        <Link href="/reviews" className="btn">
          Read all reviews
        </Link>
      </div>
    </section>
  );
}
