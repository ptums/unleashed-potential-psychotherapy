import type { CollectionMap, CollectionName, ContentRepository, PageId, PageMap } from "./types";
import { toPageId, toSlug } from "./slug";

const referenceCollections = new Set(["pages", "clinicians", "specialties", "mediaAppearances", "blogPosts"]);

/**
 * The CMS reference field is free text, so an id can be a display name ("Jess Rebelo") or a
 * route ("/what-to-expect"). This walks the content and turns every reference id into the
 * slug or page id the site uses, so every page and link reads clean ids.
 */
export function normalizeReferences(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeReferences);
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  const obj = value as Record<string, unknown>;
  if (typeof obj.collection === "string" && referenceCollections.has(obj.collection) && typeof obj.id === "string") {
    return { ...obj, id: obj.collection === "pages" ? toPageId(obj.id) : toSlug(obj.id) };
  }
  return Object.fromEntries(Object.entries(obj).map(([key, child]) => [key, normalizeReferences(child)]));
}

/** The CMS collection type (its schema id) for each site collection. */
const cmsType: Record<CollectionName, string> = {
  clinicians: "clinician-profile",
  specialties: "specialty",
  blogPosts: "blog-post",
};

/**
 * Reads published content from the CMS public API. The base URL comes from CMS_API_URL.
 *   GET /pages/{id}                          -> 1 published page
 *   GET /collections/{type}/entries          -> the published slugs of 1 collection
 *   GET /collections/{type}/entries/{slug}   -> 1 published entry
 * A 404 means "not published" and returns null (or an empty list).
 */
export function createCmsRepository(baseUrl: string): ContentRepository {
  const base = baseUrl.replace(/\/+$/, "");

  async function getJson<T>(path: string): Promise<T | null> {
    const res = await fetch(`${base}${path}`);
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`CMS GET ${path} failed with ${res.status}`);
    }
    return normalizeReferences(await res.json()) as T;
  }

  async function getEntry<C extends CollectionName>(collection: C, slug: string) {
    const type = encodeURIComponent(cmsType[collection]);
    return getJson<CollectionMap[C]>(`/collections/${type}/entries/${encodeURIComponent(toSlug(slug))}`);
  }

  return {
    async getPage<K extends PageId>(id: K) {
      return getJson<PageMap[K]>(`/pages/${encodeURIComponent(id)}`);
    },

    getEntry,

    async listSlugs(collection) {
      const slugs = await getJson<string[]>(`/collections/${encodeURIComponent(cmsType[collection])}/entries`);
      return slugs ?? [];
    },

    async getSpecialtyTile(slug) {
      const entry = await getEntry("specialties", slug);
      if (!entry) {
        return null;
      }
      return { slug: toSlug(slug), name: entry.hero.heading, summary: entry.hero.tileSummary, hasPage: true };
    },
  };
}
