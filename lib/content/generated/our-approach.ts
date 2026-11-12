/* Generated from schemas/our-approach.json by scripts/gen-types.mjs. Do not edit. */

/**
 * Content for the Our Approach page. Layout is fixed by the template; each top-level property is one zone. Header, footer and crisis line come from site settings.
 */
export interface OurApproach {
  hero: Hero;
  featureImage: FeatureImage;
  values: Values;
  standardOfCare: StandardOfCare;
  founderNote: FounderNote;
  closingCta: ClosingCallToAction;
  seo: SEO;
}
export interface Hero {
  /**
   * Small caps line above the heading.
   */
  eyebrow: string;
  /**
   * The page's only H1.
   */
  heading: string;
  /**
   * The mission. Leave a blank line between paragraphs.
   */
  intro: string;
}
export interface FeatureImage {
  hidden: boolean;
  image: Image;
}
/**
 * Wide photo (21:9). Calm interior, natural light, no posed smiles.
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
export interface Values {
  hidden: boolean;
  eyebrow: string;
  heading: string;
  /**
   * Shown in a grid. Four reads best on desktop.
   *
   * @minItems 2
   * @maxItems 6
   */
  items:
    | [TitledText, TitledText]
    | [TitledText, TitledText, TitledText]
    | [TitledText, TitledText, TitledText, TitledText]
    | [TitledText, TitledText, TitledText, TitledText, TitledText]
    | [TitledText, TitledText, TitledText, TitledText, TitledText, TitledText];
}
export interface TitledText {
  title: string;
  body: string;
}
export interface StandardOfCare {
  hidden: boolean;
  eyebrow: string;
  heading: string;
  /**
   * Each item renders as a bold lead-in followed by one sentence.
   *
   * @minItems 2
   * @maxItems 8
   */
  items:
    | [TitledText, TitledText]
    | [TitledText, TitledText, TitledText]
    | [TitledText, TitledText, TitledText, TitledText]
    | [TitledText, TitledText, TitledText, TitledText, TitledText]
    | [TitledText, TitledText, TitledText, TitledText, TitledText, TitledText]
    | [TitledText, TitledText, TitledText, TitledText, TitledText, TitledText, TitledText]
    | [TitledText, TitledText, TitledText, TitledText, TitledText, TitledText, TitledText, TitledText];
}
export interface FounderNote {
  hidden: boolean;
  eyebrow: string;
  portrait: Image1;
  /**
   * Short note in the founder's voice. Quotation marks are added by the template.
   */
  quote: string;
  founder: Reference;
  /**
   * Name with credentials, as shown under the quote.
   */
  authorName: string;
  authorRole: string;
  profileLink: Link;
}
/**
 * Portrait (4:5).
 */
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
/**
 * The founder's clinician entry.
 */
export interface Reference {
  collection: "pages" | "clinicians" | "specialties" | "mediaAppearances" | "blogPosts";
  id: string;
}
/**
 * Should point to the founder's clinician profile.
 */
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
export interface ClosingCallToAction {
  hidden: boolean;
  heading: string;
  cta: Link1;
}
/**
 * Must point to a clinician profile or the clinicians list. Booking only starts on a profile.
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
  ogImage?: Image2;
  noindex: boolean;
}
export interface Image2 {
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
