import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsHtml } from "@/components/CmsHtml";
import { CmsPicture, SectionIntro } from "@/components/ui";
import { ClosingCta, FaqList, sectionPad } from "@/components/zones";
import { getContent, isZoneVisible, type Specialty } from "@/lib/content";
import { resolveClinicians, specialtyNames, type ClinicianListItem } from "@/lib/content/clinicians";
import { seoMetadata } from "@/lib/seo";

// Only specialties with content get a page. Any other slug is a real 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getContent().listSlugs("specialties");
  return slugs.map((slug) => ({ slug }));
}

async function loadSpecialty(slug: string) {
  return getContent().getEntry("specialties", slug);
}

export async function generateMetadata({ params }: PageProps<"/specialties/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return seoMetadata((await loadSpecialty(slug))?.seo);
}

export default async function SpecialtyPage({ params }: PageProps<"/specialties/[slug]">) {
  const { slug } = await params;
  const specialty = await loadSpecialty(slug);
  if (!specialty) {
    notFound();
  }

  return (
    <>
      {isZoneVisible(specialty.hero) && <Hero zone={specialty.hero} />}
      {isZoneVisible(specialty.whoItHelps) && <WhoItHelps zone={specialty.whoItHelps} />}
      {isZoneVisible(specialty.process) && <Process zone={specialty.process} />}
      {isZoneVisible(specialty.clinicians) && <Clinicians zone={specialty.clinicians} slug={slug} />}
      {isZoneVisible(specialty.faq) && <Faq zone={specialty.faq} />}
      {isZoneVisible(specialty.closingCta) && <ClosingCta zone={specialty.closingCta} />}
    </>
  );
}

function Hero({ zone }: { zone: Specialty["hero"] }) {
  return (
    <section className="py-[clamp(56px,8vw,112px)]">
      <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-center gap-[clamp(40px,6vw,96px)]">
        <div className="flex flex-col gap-6">
          <p className="eyebrow">{zone.eyebrow}</p>
          <h1 className="text-h1">{zone.heading}</h1>
          <CmsHtml html={zone.intro} className="flex flex-col gap-4 text-lead" />
          {zone.evidenceNote && <p className="text-small text-forest">{zone.evidenceNote}</p>}
          <a href="#clinicians" className="btn self-start">
            {zone.ctaLabel}
          </a>
        </div>
        <CmsPicture image={zone.image} className="aspect-[5/4] w-full" />
      </div>
    </section>
  );
}

function WhoItHelps({ zone }: { zone: Specialty["whoItHelps"] }) {
  return (
    <section aria-labelledby="who-heading" className={`bg-cream-light ${sectionPad}`}>
      <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(min(400px,100%),1fr))] gap-12">
        <SectionIntro id="who-heading" eyebrow={zone.eyebrow} heading={zone.heading} />
        <ul className="m-0 list-none border-b border-forest p-0">
          {zone.items.map((item) => (
            <li key={item} className="border-t border-forest py-4">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Process({ zone }: { zone: Specialty["process"] }) {
  return (
    <section aria-labelledby="process-heading" className={sectionPad}>
      <div className="wrap flex flex-col gap-12">
        <SectionIntro id="process-heading" eyebrow={zone.eyebrow} heading={zone.heading} />
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-10 p-0">
          {zone.steps.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2.5 border-t border-forest pt-6">
              <span aria-hidden="true" className="font-display text-[40px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-2xl">{step.title}</h3>
              <CmsHtml html={step.body} className="[&_p+p]:mt-3" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

async function Clinicians({ zone, slug }: { zone: Specialty["clinicians"]; slug: string }) {
  const clinicians = await resolveClinicians(getContent(), {
    mode: zone.mode,
    refs: zone.clinicians,
    specialty: slug,
  });

  return (
    <section id="clinicians" aria-labelledby="clinicians-heading" className={`bg-cream-light ${sectionPad}`}>
      <div className="wrap flex flex-col gap-10">
        <SectionIntro id="clinicians-heading" eyebrow={zone.eyebrow} heading={zone.heading} />
        {clinicians.map((item) => (
          <ClinicianRow key={item.slug} item={item} ctaLabel={zone.cardCtaLabel} />
        ))}
      </div>
    </section>
  );
}

async function ClinicianRow({ item, ctaLabel }: { item: ClinicianListItem; ctaLabel: string }) {
  const header = item.profile.profileHeader;
  const names = await specialtyNames(getContent(), item.profile);

  return (
    <article className="flex max-w-[820px] flex-wrap gap-8 bg-linen p-8">
      <CmsPicture image={header.portrait} className="aspect-square flex-[1_1_220px]" />
      <div className="flex flex-[2_1_300px] flex-col gap-2.5">
        <h3 className="text-[30px]">{header.displayName}</h3>
        {names.length > 0 && <p className="text-small">{names.join(" · ")}</p>}
        {header.sessionsLine && <p className="text-small">{header.sessionsLine}</p>}
        <Link href={`/clinicians/${item.slug}`} className="btn mt-auto min-h-11 self-start px-5 py-2.5 text-label">
          {ctaLabel}
          <span className="sr-only">: {header.displayName}</span>
        </Link>
      </div>
    </article>
  );
}

function Faq({ zone }: { zone: Specialty["faq"] }) {
  return (
    <section aria-labelledby="faq-heading" className={sectionPad}>
      <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(min(360px,100%),1fr))] gap-12">
        <SectionIntro id="faq-heading" eyebrow={zone.eyebrow} heading={zone.heading} />
        <FaqList items={zone.items} />
      </div>
    </section>
  );
}
