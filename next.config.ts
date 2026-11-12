import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Pages are built as static HTML at build time from the content source (CONTENT_SOURCE).
// cacheComponents stays off: static pages need no ISR cache on Workers, and unknown slugs
// return a real 404 (dynamicParams = false on slug routes).
const nextConfig: NextConfig = {
  cacheComponents: false,
  // Inline the content source at build time, so a page the Worker renders at request time
  // reads the same source as the prerendered HTML. No secrets here: both values are public.
  env: {
    CONTENT_SOURCE: process.env.CONTENT_SOURCE ?? "mock",
    CMS_API_URL: process.env.CMS_API_URL ?? "",
  },
  // www is served by the same Worker; send it to the bare domain so there is one canonical URL.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.uptherapygroup.com" }],
        destination: "https://uptherapygroup.com/:path*",
        permanent: true,
      },
      // Jess's profile moved to her CMS slug. Old links keep working.
      {
        source: "/clinicians/jess-rebelo",
        destination: "/clinicians/jessica-rebelo",
        permanent: true,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
