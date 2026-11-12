import { getContent, type ContentRepository, type SpecialtyTile } from "@/lib/content";
import { site, type NavGroup, type NavLink } from "@/lib/site";

/** 1 nav link per published specialty page, sorted by name. */
export async function specialtyLinks(content: ContentRepository): Promise<NavLink[]> {
  const slugs = await content.listSlugs("specialties");
  const tiles = await Promise.all(slugs.map((slug) => content.getSpecialtyTile(slug)));
  return tiles
    .filter((tile): tile is SpecialtyTile => tile !== null && tile.hasPage)
    .map((tile) => ({ label: tile.name, href: `/specialties/${tile.slug}` }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** The header nav, with the Specialties group filled from the content source. */
export async function getNav(content: ContentRepository = getContent()): Promise<NavGroup[]> {
  const specialties = await specialtyLinks(content);
  return site.nav.map((group) => {
    if (group.label !== "Specialties" || specialties.length === 0) {
      return group;
    }
    return { ...group, links: specialties };
  });
}
