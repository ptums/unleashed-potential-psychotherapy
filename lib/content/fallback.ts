import type { CollectionName, ContentRepository, PageId } from "./types";

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
      return (await primary.getEntry(collection, slug)) ?? fallback.getEntry(collection, slug);
    },
    async listSlugs(collection) {
      const [fromPrimary, fromFallback] = await Promise.all([
        primary.listSlugs(collection),
        fallback.listSlugs(collection),
      ]);
      return [...new Set([...fromPrimary, ...fromFallback])];
    },
    async getSpecialtyTile(slug) {
      return (await primary.getSpecialtyTile(slug)) ?? fallback.getSpecialtyTile(slug);
    },
  };
}
