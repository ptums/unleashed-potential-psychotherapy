/* Generated from schemas/specialty.json by scripts/gen-types.mjs. Do not edit. */

/**
 * One entry per specialty or method (e.g. EMDR). Layout is fixed by the template; each top-level property is one zone. Header, footer and crisis line come from site settings.
 */
export interface Specialty {
  hero: Hero;
  whoItHelps: WhoItHelps;
  process: Process;
  clinicians: CliniciansWhoOfferThis;
  faq: FAQ;
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
   * What it is, in two sentences.
   */
  intro: string;
  /**
   * Optional line on the research behind it.
   */
  evidenceNote?: string;
  /**
   * One line used on the Home specialties tile. Not shown on this page.
   */
  tileSummary: string;
  /**
   * Scrolls to the clinicians zone.
   */
  ctaLabel: string;
  image: Image;
}
/**
 * Landscape photo (5:4).
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
export interface WhoItHelps {
  hidden: boolean;
  eyebrow: string;
  heading: string;
  /**
   * @minItems 2
   * @maxItems 8
   */
  items:
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string]
    | [string, string, string, string, string, string]
    | [string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string];
}
export interface Process {
  hidden: boolean;
  eyebrow: string;
  heading: string;
  /**
   * Numbered automatically.
   *
   * @minItems 2
   * @maxItems 6
   */
  steps:
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
export interface CliniciansWhoOfferThis {
  hidden: boolean;
  eyebrow: string;
  heading: string;
  /**
   * auto lists every published clinician who has this specialty on their profile.
   */
  mode: "auto" | "manual";
  /**
   * Used only when mode is manual.
   *
   * @minItems 0
   * @maxItems 12
   */
  clinicians?:
    | []
    | [Reference]
    | [Reference, Reference]
    | [Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference]
    | [
        Reference,
        Reference,
        Reference,
        Reference,
        Reference,
        Reference,
        Reference,
        Reference,
        Reference,
        Reference,
        Reference
      ]
    | [
        Reference,
        Reference,
        Reference,
        Reference,
        Reference,
        Reference,
        Reference,
        Reference,
        Reference,
        Reference,
        Reference,
        Reference
      ];
  /**
   * Card button always opens the clinician's profile.
   */
  cardCtaLabel: string;
}
export interface Reference {
  collection: "pages" | "clinicians" | "specialties" | "mediaAppearances" | "blogPosts";
  id: string;
}
export interface FAQ {
  hidden: boolean;
  eyebrow: string;
  heading: string;
  /**
   * @minItems 1
   * @maxItems 8
   */
  items:
    | [FaqItem]
    | [FaqItem, FaqItem]
    | [FaqItem, FaqItem, FaqItem]
    | [FaqItem, FaqItem, FaqItem, FaqItem]
    | [FaqItem, FaqItem, FaqItem, FaqItem, FaqItem]
    | [FaqItem, FaqItem, FaqItem, FaqItem, FaqItem, FaqItem]
    | [FaqItem, FaqItem, FaqItem, FaqItem, FaqItem, FaqItem, FaqItem]
    | [FaqItem, FaqItem, FaqItem, FaqItem, FaqItem, FaqItem, FaqItem, FaqItem];
}
export interface FaqItem {
  question: string;
  answer: string;
}
export interface ClosingCallToAction {
  hidden: boolean;
  heading: string;
  cta: Link;
}
/**
 * Must go to the clinicians list or a profile, never straight to booking.
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
