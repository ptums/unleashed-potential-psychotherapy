import type { Metadata } from "next";
import { isZoneVisible } from "./content";

export interface SeoZone {
  title: string;
  description: string;
  noindex?: boolean;
}

/** Page metadata from a page's `seo` zone (the CMS "meta" zone). */
export function seoMetadata(seo: SeoZone | null | undefined): Metadata {
  if (!isZoneVisible(seo)) {
    return {};
  }
  return {
    title: { absolute: seo.title },
    description: seo.description,
    robots: seo.noindex ? { index: false } : undefined,
  };
}
