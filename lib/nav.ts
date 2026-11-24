import { getContent, type ContentRepository, type SpecialtyTile } from "@/lib/content";
import { site, type NavGroup, type NavLink, type NavSection } from "@/lib/site";

/** 1 nav link per published specialty page, sorted by name. */
export async function specialtyLinks(content: ContentRepository): Promise<NavLink[]> {
  const slugs = await content.listSlugs("specialties");
  const tiles = await Promise.all(slugs.map((slug) => content.getSpecialtyTile(slug)));
  return tiles
    .filter((tile): tile is SpecialtyTile => tile !== null && tile.hasPage)
    .map((tile) => ({ label: tile.name, href: `/specialties/${tile.slug}` }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** 1 link per published clinician, sorted by name. The label drops the credentials: "Jess Rebelo, LCSW" is "Jess Rebelo". */
export async function therapistLinks(content: ContentRepository): Promise<NavLink[]> {
  const slugs = await content.listSlugs("clinicians");
  const entries = await Promise.all(slugs.map(async (slug) => ({ slug, profile: await content.getEntry("clinicians", slug) })));
  return entries
    .flatMap(({ slug, profile }) => (profile ? [{ label: profile.profileHeader.displayName.split(",")[0].trim(), href: `/clinicians/${slug}` }] : []))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** 1 link per person in the CMS "Trusted Referrals" section, in CMS order. They open the person's own site. */
export async function referralLinks(content: ContentRepository): Promise<NavLink[]> {
  const page = await content.getPage("trusted-referrals");
  return (page?.referrals.items ?? []).map((referral) => ({ label: referral.name, href: referral.link, external: true }));
}

/** The Clinicians menu: Therapists, then Trusted Referrals. An empty list is left out. */
async function clinicianSections(content: ContentRepository): Promise<NavSection[]> {
  const [therapists, referrals] = await Promise.all([therapistLinks(content), referralLinks(content)]);
  const sections = [
    { label: "Therapists", links: therapists },
    { label: "Trusted Referrals", links: referrals },
  ];
  return sections.filter((section) => section.links.length > 0);
}

/** The header nav, with the Specialties and Clinicians groups filled from the content source. */
export async function getNav(content: ContentRepository = getContent()): Promise<NavGroup[]> {
  const [specialties, clinicians] = await Promise.all([specialtyLinks(content), clinicianSections(content)]);
  return site.nav
    .map((group) => {
      if (group.label === "Specialties" && specialties.length > 0) {
        return { ...group, links: specialties };
      }
      if (group.label === "Clinicians") {
        return { ...group, sections: clinicians };
      }
      return group;
    })
    .filter((group) => group.links.length > 0 || (group.sections?.length ?? 0) > 0);
}
