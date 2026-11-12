import type { Reference } from "./content/types";

export interface CmsLink {
  label: string;
  target: { internal: Reference; anchor?: string } | { url: string };
}

// CMS page ids that map to a route. A page id not listed here has no page yet.
const pageRoutes: Record<string, string> = {
  home: "/",
  "our-approach": "/our-approach",
  "what-to-expect": "/what-to-expect",
  "featured-in": "/featured-in",
  blog: "/blog",
  reviews: "/reviews",
  "share-experience": "/reviews/share",
  // There is no clinicians list page; the list lives on Home.
  clinicians: "/#clinicians",
};

/** The URL for a reference, or null when the target has no page (the link is then hidden). */
export function hrefForReference(ref: Reference): string | null {
  switch (ref.collection) {
    case "pages":
      return pageRoutes[ref.id] ?? null;
    case "clinicians":
      return `/clinicians/${ref.id}`;
    case "specialties":
      return `/specialties/${ref.id}`;
    case "blogPosts":
      return `/blog/${ref.id}`;
    case "mediaAppearances":
      return "/featured-in";
  }
}

/** The URL for a CMS link, or null when it points to a page that does not exist yet. */
export function hrefForLink(link: CmsLink | undefined): string | null {
  if (!link) {
    return null;
  }
  if ("url" in link.target) {
    return link.target.url;
  }
  const base = hrefForReference(link.target.internal);
  if (!base) {
    return null;
  }
  return link.target.anchor ? `${base}#${link.target.anchor}` : base;
}
