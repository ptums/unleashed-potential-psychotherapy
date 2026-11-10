import type { ContentRepository, PageId, PageMap } from "./types";

/** Reads published content from the CMS public API. The base URL comes from CMS_API_URL. */
export function createCmsRepository(baseUrl: string): ContentRepository {
  const base = baseUrl.replace(/\/+$/, "");

  return {
    async getPage<K extends PageId>(id: K) {
      const res = await fetch(`${base}/pages/${encodeURIComponent(id)}`);
      if (res.status === 404) {
        return null;
      }
      if (!res.ok) {
        throw new Error(`CMS GET /pages/${id} failed with ${res.status}`);
      }
      return (await res.json()) as PageMap[K];
    },

    // TODO(TWS-117): the CMS has no public route for collection entries yet
    // (clinicians, specialties, blogPosts). Until it does, slug pages need CONTENT_SOURCE=mock.
    async getEntry(collection) {
      throw new Error(`CMS has no public route for ${collection} entries yet`);
    },
    async listSlugs(collection) {
      throw new Error(`CMS has no public route for ${collection} entries yet`);
    },
  };
}
