import { createCmsRepository } from "./cms";
import { mockRepository } from "./mock";
import { withFallback } from "./fallback";
import type { ContentRepository } from "./types";

export * from "./types";
export { isZoneVisible } from "./zones";

export type ContentEnv = Record<string, string | undefined>;

/**
 * The content source as set at build time. These must stay literal `process.env.X` reads:
 * next.config.ts `env` inlines exactly those expressions. Reading them off the process.env
 * object at runtime gave nothing on the Worker (the values exist only in the build), so code
 * that runs per request (/api/availability, /api/submit) silently used the mock content.
 */
function buildEnv(): ContentEnv {
  return { CONTENT_SOURCE: process.env.CONTENT_SOURCE, CMS_API_URL: process.env.CMS_API_URL };
}

/**
 * Picks the content source from env.
 * CONTENT_SOURCE=mock (default): the handoff mock content in content/mock.
 * CONTENT_SOURCE=cms: the live CMS at CMS_API_URL, with the mock for anything not published yet.
 */
export function getContent(env: ContentEnv = buildEnv()): ContentRepository {
  if (env.CONTENT_SOURCE !== "cms") {
    return mockRepository;
  }
  const url = env.CMS_API_URL;
  if (!url) {
    throw new Error("CONTENT_SOURCE=cms needs CMS_API_URL");
  }
  return withFallback(createCmsRepository(url), mockRepository);
}
