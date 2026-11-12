import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CmsHtml } from "@/components/CmsHtml";
import { CalendarCheckIcon, FloatingAction } from "@/components/FloatingAction";
import { CmsLinkTo, CmsPicture } from "@/components/ui";
import { getContent, isZoneVisible, type ClinicianProfile, type SpecialtyTile } from "@/lib/content";
import type { SessionType } from "@/lib/content/generated/clinician-profile";
import { getMediaAppearance } from "@/lib/media";
import { seoMetadata } from "@/lib/seo";

// Only clinicians with content get a page. Any other slug is a real 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getContent().listSlugs("clinicians");
  return slugs.map((slug) => ({ slug }));
}

async function loadClinician(slug: string) {
  return getContent().getEntry("clinicians", slug);
}

export async function generateMetadata({ params }: PageProps<"/clinicians/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return seoMetadata((await loadClinician(slug))?.seo);
}

export default async function ClinicianProfilePage({ params }: PageProps<"/clinicians/[slug]">) {
  const { slug } = await params;
  const profile = await loadClinician(slug);
  if (!profile) {
    notFound();
  }
  const header = profile.profileHeader;
  const content = getContent();
  const tiles = (await Promise.all(header.specialties.map((ref) => content.getSpecialtyTile(ref.id)))).filter(
    (t): t is SpecialtyTile => t !== null,
  );

  return (
    <>
      <div className="wrap pt-6">
        <nav aria-label="Breadcrumb">
          <ol className="m-0 flex list-none flex-wrap gap-2 p-0 text-small">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/#clinicians">Our Clinicians</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{header.displayName}</li>
          </ol>
        </nav>
      </div>

      {/* TODO(TWS-117 API phase): booking needs the Google Calendar integration, so this button
          does nothing yet. It is first in the tab order after the breadcrumb. */}
      <FloatingAction label={`Book with ${header.firstName}`} icon={<CalendarCheckIcon />} />

      <section className="pt-[clamp(32px,5vw,64px)] pb-[clamp(48px,6vw,80px)]">
        <div className="wrap flex flex-wrap items-start gap-12">
          <CmsPicture image={header.portrait} className="aspect-[3/4] max-w-[380px] flex-[1_1_280px]" />
          <div className="flex flex-[2_1_340px] flex-col gap-5">
            <p className="eyebrow">{header.roleLine}</p>
            <h1 className="text-[clamp(40px,4.4vw,60px)]">{header.displayName}</h1>
            <CmsHtml html={header.summary} className="text-lead [&_p+p]:mt-4" />
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-small">
              {header.ages && <Fact label="Sees">{header.ages}</Fact>}
              {header.sessionsLine && <Fact label="Sessions">{header.sessionsLine}</Fact>}
              {header.languages && header.languages.length > 0 && (
                <Fact label="Languages">{header.languages.join(", ")}</Fact>
              )}
            </ul>
            {tiles.length > 0 && (
              <ul aria-label="Specialties" className="m-0 flex list-none flex-wrap gap-2 p-0">
                {tiles.map((tile) => {
                  const chip = "inline-flex min-h-11 items-center border border-forest px-3.5 py-1 text-small";
                  return (
                    <li key={tile.slug}>
                      {tile.hasPage ? (
                        <Link href={`/specialties/${tile.slug}`} className={chip}>
                          {tile.name}
                        </Link>
                      ) : (
                        <span className={chip}>{tile.name}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      <div className="wrap pb-[clamp(64px,8vw,112px)]">
        {isZoneVisible(profile.approach) && (
          <Row heading={profile.approach.heading}>
            <CmsHtml html={profile.approach.body} className="flex flex-col gap-4" />
          </Row>
        )}
        {isZoneVisible(profile.credentials) && <Credentials zone={profile.credentials} />}
        {isZoneVisible(profile.fees) && <Fees zone={profile.fees} />}
        {isZoneVisible(profile.featuredIn) && <FeaturedIn zone={profile.featuredIn} />}
        <div className="border-t border-forest" />
      </div>

      {/* TODO(TWS-117 API phase): the closing band shows the next open time and a booking button.
          Both need the Google Calendar integration, so the band is hidden until then. */}
    </>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li>
      <strong>{label}:</strong> {children}
    </li>
  );
}

function Row({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-x-16 gap-y-6 border-t border-forest py-12">
      <h2 className="text-[32px]">{heading}</h2>
      {children}
    </section>
  );
}

function Credentials({ zone }: { zone: ClinicianProfile["credentials"] }) {
  const items: { label: string; value: string }[] = [];
  for (const e of zone.education ?? []) {
    items.push({ label: "Education", value: `${e.degree}, ${e.institution}` });
  }
  for (const l of zone.licenses ?? []) {
    items.push({ label: "License", value: `${l.type}, ${l.state} #${l.number}` });
  }
  for (const t of zone.trainings ?? []) {
    items.push({ label: "Training", value: t.provider ? `${t.name}, ${t.provider}` : t.name });
  }
  if (zone.practicingSince) {
    items.push({ label: "In practice since", value: String(zone.practicingSince) });
  }
  if (items.length === 0) {
    return null;
  }

  return (
    <Row heading={zone.heading}>
      <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-x-8 gap-y-5">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`}>
            <dt className="font-bold">{item.label}</dt>
            <dd className="m-0">{item.value}</dd>
          </div>
        ))}
      </dl>
    </Row>
  );
}

function sessionLength(s: SessionType) {
  return s.maxMinutes ? `${s.minMinutes}–${s.maxMinutes} min` : `${s.minMinutes} min`;
}

// The price is shown as the editor typed it ("Free", "$255"). The 2 older keywords read as words.
function sessionPrice(s: SessionType) {
  const price = s.price.trim();
  if (price.toLowerCase() === "free") {
    return "Free";
  }
  if (price.toLowerCase() === "contact") {
    return "Contact us";
  }
  return price;
}

const insuranceText: Record<ClinicianProfile["fees"]["insuranceStatus"], string> = {
  in_network: "In network with insurance.",
  out_of_network: "Out of network with insurance.",
  both: "In network with some plans, out of network with others.",
  self_pay_only: "Self-pay only.",
};

function Fees({ zone }: { zone: ClinicianProfile["fees"] }) {
  const notes = [
    insuranceText[zone.insuranceStatus],
    zone.superbills ? "Superbills are available for out-of-network reimbursement." : null,
    zone.slidingScale ? "A sliding scale is available." : null,
    zone.insuranceNote ?? null,
    zone.showGoodFaithEstimateNotice
      ? "You can request a Good Faith Estimate of costs before your first session."
      : null,
  ].filter(Boolean);

  return (
    <Row heading={zone.heading}>
      <div className="flex flex-col gap-5">
        <table className="w-full border-collapse">
          <caption className="pb-2 text-left text-small">{zone.caption}</caption>
          <tbody>
            {zone.sessionTypes.map((s, i) => (
              <tr
                key={s.key}
                className={`border-t border-forest ${i === zone.sessionTypes.length - 1 ? "border-b" : ""}`}
              >
                <th scope="row" className="py-3.5 text-left font-normal">
                  {s.label} · {sessionLength(s)}
                </th>
                <td className="text-right font-bold">{sessionPrice(s)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-small">{notes.join(" ")}</p>
      </div>
    </Row>
  );
}

function FeaturedIn({ zone }: { zone: ClinicianProfile["featuredIn"] }) {
  const appearances = zone.appearances
    .map((ref) => getMediaAppearance(ref.id))
    .filter((a): a is NonNullable<typeof a> => a !== null && a.links.length > 0);

  return (
    <Row heading={zone.heading}>
      <ul className="m-0 flex flex-col gap-2 pl-5">
        {appearances.map((a) => {
          const [main, ...more] = a.links;
          return (
            <li key={a.id}>
              <a href={main.url}>
                {a.outlet}: {a.title}
              </a>
              {more.length > 0 && (
                <>
                  {" "}
                  (also on{" "}
                  {more.map((link, i) => (
                    <span key={link.url}>
                      {i > 0 && " and "}
                      <a href={link.url}>{link.label}</a>
                    </span>
                  ))}
                  )
                </>
              )}
            </li>
          );
        })}
        <li className="list-none">
          <CmsLinkTo link={zone.allLink} className="font-bold" />
        </li>
      </ul>
    </Row>
  );
}
