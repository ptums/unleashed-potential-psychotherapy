import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Serve the HTML built at deploy time (from the CMS) out of Workers static assets.
// Without this cache, the Worker renders each page again at request time with the Worker's
// own env, which has no CONTENT_SOURCE, so it showed the mock. Pages change only on a deploy.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
