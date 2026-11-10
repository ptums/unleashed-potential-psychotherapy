import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Pages are built as static HTML at build time from the content source (CONTENT_SOURCE).
// cacheComponents stays off: static pages need no ISR cache on Workers, and unknown slugs
// return a real 404 (dynamicParams = false on slug routes).
const nextConfig: NextConfig = {
  cacheComponents: false,
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
