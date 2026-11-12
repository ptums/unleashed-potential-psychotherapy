/* Generated from schemas/reviews.json by scripts/gen-types.mjs. Do not edit. */

/**
 * Content for the Client Reviews page. Layout is fixed by the template; each top-level property is one zone. Reviews live in reviewList.items, in display order. Header, footer and crisis line come from site settings.
 */
export interface ClientReviews {
  hero: Hero;
  featureImage: FeatureImage;
  reviewList: Reviews;
  closingCta: ClosingCallToAction;
  seo: SEO;
}
export interface Hero {
  eyebrow: string;
  /**
   * The page's only H1.
   */
  heading: string;
  /**
   * Leave a blank line between paragraphs.
   */
  intro: string;
}
/**
 * A hairline divider follows this zone, as on Our Approach.
 */
export interface FeatureImage {
  hidden: boolean;
  image: Image;
}
/**
 * Wide photo (21:9). Calm interior, natural light.
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
export interface Reviews {
  hidden: boolean;
  eyebrow: string;
  heading: string;
  /**
   * Shown beside the list. {count} is the number of visible reviews.
   */
  summary: string;
  asideLink?: Link;
  /**
   * Longer reviews show five lines and a Read full review button.
   */
  collapseAfterChars: number;
  expandLabel: string;
  collapseLabel: string;
  /**
   * Shown in this order.
   *
   * @minItems 1
   * @maxItems 200
   */
  items: [Review, ...Review[]];
}
/**
 * Button under the summary.
 */
export interface Link {
  label: string;
  target:
    | {
        internal: Reference;
        anchor?: string;
      }
    | {
        url: string;
      };
}
export interface Reference {
  collection: "pages" | "clinicians" | "specialties" | "mediaAppearances" | "blogPosts";
  id: string;
}
export interface Review {
  /**
   * First name and last initial only, e.g. Kevin D. Never a full last name.
   */
  displayName: string;
  /**
   * The client's words, verbatim. Fix nothing except stray whitespace.
   */
  text: string;
  /**
   * Must be true: written permission to publish this review is on file.
   */
  consentOnFile: true;
  /**
   * When the review was received. Internal; not shown.
   */
  receivedDate?: string | null;
  /**
   * Hide this one review without deleting it.
   */
  hidden: boolean;
}
export interface ClosingCallToAction {
  hidden: boolean;
  heading: string;
  body?: string;
  cta: Link1;
}
/**
 * Must point to a clinician profile or the clinicians list. Booking only starts on a profile.
 */
export interface Link1 {
  label: string;
  target:
    | {
        internal: Reference;
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
