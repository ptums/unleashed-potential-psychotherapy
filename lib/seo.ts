import type { Metadata } from "next";
import { cmsImageUrl, type CmsImage } from "@/components/ui";
import { getContent, isZoneVisible } from "./content";
import { site, siteUrl } from "./site";

export interface SeoZone {
  title: string;
  description: string;
  noindex?: boolean;
  /** The CMS share image. It wins over the page's own image. */
  ogImage?: CmsImage;
}

export interface ShareOptions {
  /** The page's path, for the canonical and og:url, for example "/blog/finding-your-ground". */
  path: string;
  /** The page's main image (hero, portrait, article header). Used when the CMS sets no share image. */
  image?: CmsImage | null;
  type?: "website" | "article" | "profile";
  /** Articles: the publish date (yyyy-mm-dd). */
  publishedTime?: string;
  /** Articles: the author's name. */
  author?: string;
}

/** An uploaded CMS image as a share image, or null for a missing or placeholder image. */
function shareImage(image: CmsImage | null | undefined) {
  const url = image ? cmsImageUrl(image.assetId) : null;
  return url && image ? { url, alt: image.alt } : null;
}

/** The fallback share image for pages with no image of their own: the Home hero. */
async function defaultShareImage() {
  const home = await getContent().getPage("home");
  return shareImage(home?.hero.image);
}

/**
 * Page metadata from a page's `seo` zone (the CMS "meta" zone), plus the share tags (Open Graph and
 * Twitter cards) that make a link show a title, a description and an image on social media.
 * The image: the CMS share image, else the page's own image, else the Home hero.
 */
export async function seoMetadata(seo: SeoZone | null | undefined, share: ShareOptions): Promise<Metadata> {
  if (!isZoneVisible(seo)) {
    return {};
  }
  const image = shareImage(seo.ogImage) ?? shareImage(share.image) ?? (await defaultShareImage());
  const url = `${siteUrl}${share.path}`;
  const type = share.type ?? "website";

  return {
    title: { absolute: seo.title },
    description: seo.description,
    robots: seo.noindex ? { index: false } : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: site.name,
      locale: "en_US",
      ...(type === "article"
        ? { type, publishedTime: share.publishedTime, authors: share.author ? [share.author] : undefined }
        : { type }),
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: seo.title,
      description: seo.description,
      images: image ? [image] : undefined,
    },
  };
}
