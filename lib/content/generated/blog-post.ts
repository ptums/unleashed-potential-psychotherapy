/* Generated from schemas/blog-post.json by scripts/gen-types.mjs. Do not edit. */

/**
 * One entry per article. Layout is fixed by the template; each top-level property is one zone. Header, footer and crisis line come from site settings.
 */
export interface BlogPost {
  articleHeader: ArticleHeader;
  body: ArticleBody;
  crisisCallout: CrisisCallout;
  authorBox: AuthorBox;
  related: KeepReading;
  closingCta: ClosingCallToAction;
  seo: SEO;
}
export interface ArticleHeader {
  /**
   * Must match a topic on the blog page.
   */
  topic: string;
  /**
   * The page's only H1.
   */
  heading: string;
  /**
   * One-sentence summary under the title. Also used on cards.
   */
  dek: string;
  author: Reference;
  publishDate: string;
  readMinutes: number;
  image: Image;
}
/**
 * The author's clinician entry. Name and credentials come from there.
 */
export interface Reference {
  collection: "pages" | "clinicians" | "specialties" | "mediaAppearances" | "blogPosts";
  id: string;
}
/**
 * Wide photo (21:9). Also used on cards.
 */
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
/**
 * Keep hidden false.
 */
export interface ArticleBody {
  hidden: boolean;
  /**
   * Use H2 and H3 only; the title is the H1.
   */
  content: string;
}
/**
 * Recommended on every post about trauma, grief or mental health.
 */
export interface CrisisCallout {
  hidden: boolean;
  heading: string;
  body: string;
}
export interface AuthorBox {
  hidden: boolean;
  /**
   * Overrides the clinician's summary when filled.
   */
  bio?: string;
  linkLabel: string;
}
export interface KeepReading {
  hidden: boolean;
  heading: string;
  /**
   * auto picks recent posts on the same topic.
   */
  mode: "auto" | "manual";
  /**
   * Used only when mode is manual.
   *
   * @minItems 0
   * @maxItems 3
   */
  posts?: [] | [Reference1] | [Reference1, Reference1] | [Reference1, Reference1, Reference1];
  allLink: Link;
}
export interface Reference1 {
  collection: "pages" | "clinicians" | "specialties" | "mediaAppearances" | "blogPosts";
  id: string;
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
export interface ClosingCallToAction {
  hidden: boolean;
  heading: string;
  body?: string;
  cta: Link1;
}
/**
 * Must go to the clinicians list or a profile, never straight to booking.
 */
export interface Link1 {
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
export interface SEO {
  title: string;
  description: string;
  ogImage?: Image1;
  noindex: boolean;
}
export interface Image1 {
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
