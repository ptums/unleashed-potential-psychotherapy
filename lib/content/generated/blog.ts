/* Generated from schemas/blog.json by scripts/gen-types.mjs. Do not edit. */

/**
 * Content for the blog landing page. Posts come from the Blog Post collection. Layout is fixed by the template; each top-level property is one zone. Header, footer and crisis line come from site settings.
 */
export interface Blog {
  hero: Hero;
  featuredPost: FeaturedPost;
  articleList: AllArticles;
  closingCta: ClosingCallToAction;
  seo: SEO;
}
export interface Hero {
  eyebrow: string;
  /**
   * The page's only H1.
   */
  heading: string;
  intro: string;
}
export interface FeaturedPost {
  hidden: boolean;
  mode: "latest" | "manual";
  post?: Reference;
  /**
   * The post's topic is added after it automatically.
   */
  eyebrow: string;
  ctaLabel: string;
}
/**
 * Used only when mode is manual.
 */
export interface Reference {
  collection: "pages" | "clinicians" | "specialties" | "mediaAppearances" | "blogPosts";
  id: string;
}
export interface AllArticles {
  hidden: boolean;
  heading: string;
  allTopicsLabel: string;
  /**
   * Filter buttons, in order. Must match the topic names used on posts.
   *
   * @minItems 1
   * @maxItems 10
   */
  topics:
    | [string]
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string]
    | [string, string, string, string, string, string]
    | [string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string, string, string];
  pageSize: number;
  emptyMessage: string;
}
export interface ClosingCallToAction {
  hidden: boolean;
  heading: string;
  body?: string;
  cta: Link;
}
export interface Link {
  label: string;
  target:
    | {
        internal: Reference1;
        anchor?: string;
      }
    | {
        url: string;
      };
}
export interface Reference1 {
  collection: "pages" | "clinicians" | "specialties" | "mediaAppearances" | "blogPosts";
  id: string;
}
export interface SEO {
  title: string;
  description: string;
  ogImage?: Image;
  noindex: boolean;
}
export interface Image {
  assetId: string;
  /**
   * Required for WCAG.
   */
  alt: string;
  focalPoint?: {
    x: number;
    y: number;
  };
}
