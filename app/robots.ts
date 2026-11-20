import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Reviewed for launch (UPTG-31, 2026-11-20):
// - /api/ is blocked: form endpoints and calendar data, nothing to index.
// - /book and /reviews/share stay crawlable on purpose. They send a noindex meta tag, and a
//   crawler must be able to fetch a page to see its noindex. Blocking them here could leave
//   the bare URLs in search results.
// - AI crawlers are allowed, so they can read the site and /llms.txt.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
