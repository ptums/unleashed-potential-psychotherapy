import type { CollectionName, ContentRepository, PageId } from "./types";

// Collections the CMS fully owns. The mock entries never show for these, so the blog
// lists only real, published posts (decided 2026-11-11).
const cmsOnly = new Set<CollectionName>(["blogPosts"]);

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
      return (await primary.getSpecialtyTile(slug)) ?? fallback.getSpecialtyTile(slug);
    },
  };
}
