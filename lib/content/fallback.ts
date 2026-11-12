import type { CollectionName, ContentRepository, PageId } from "./types";

// Collections the CMS fully owns. The mock entries never show for these, so the site lists
// only real, published posts and specialty pages (blog 2026-11-11, specialties 2026-11-12).
const cmsOnly = new Set<CollectionName>(["blogPosts", "specialties"]);

/**
 * Reads from `primary` (the CMS) and uses `fallback` (the mock) for content that is not
 * published yet. This keeps every page of the site live while the CMS fills up.
 * Remove the fallback once all pages and entries are published in the CMS.
 */
export function withFallback(primary: ContentRepository, fallback: ContentRepository): ContentRepository {
  return {
    async getPage<K extends PageId>(id: K) {
      return (await primary.getPage(id)) ?? fallback.getPage(id);
    },
    async getEntry<C extends CollectionName>(collection: C, slug: string) {
      const entry = await primary.getEntry(collection, slug);
      if (entry || cmsOnly.has(collection)) {
        return entry;
      }
      return fallback.getEntry(collection, slug);
    },
    async listSlugs(collection) {
      const fromPrimary = await primary.listSlugs(collection);
      if (cmsOnly.has(collection)) {
        return fromPrimary;
      }
      const fromFallback = await fallback.listSlugs(collection);
      return [...new Set([...fromPrimary, ...fromFallback])];
    },
    async getSpecialtyTile(slug) {
      const tile = await primary.getSpecialtyTile(slug);
      if (tile) {
        return tile;
      }
      // The mock still names a specialty (for a clinician profile), but never gives it a page.
      const mock = await fallback.getSpecialtyTile(slug);
      return mock ? { ...mock, hasPage: false } : null;
    },
  };
}
