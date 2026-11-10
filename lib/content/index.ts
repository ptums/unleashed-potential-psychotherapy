import { createCmsRepository } from "./cms";
import { mockRepository } from "./mock";
import type { ContentRepository } from "./types";

export * from "./types";
export { isZoneVisible } from "./zones";

export type ContentEnv = Record<string, string | undefined>;

/**
 * Picks the content source from env.
 * CONTENT_SOURCE=mock (default): the handoff mock content in content/mock.
 * CONTENT_SOURCE=cms: the live CMS at CMS_API_URL.
 */
export function getContent(env: ContentEnv = process.env): ContentRepository {
  if (env.CONTENT_SOURCE !== "cms") {
    return mockRepository;
  }
  const url = env.CMS_API_URL;
  if (!url) {
    throw new Error("CONTENT_SOURCE=cms needs CMS_API_URL");
  }
  return createCmsRepository(url);
}
