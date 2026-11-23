/* Generated from schemas/notice-of-privacy-practices.json by scripts/gen-types.mjs. Do not edit. */

/**
 * Content for the Notice of Privacy Practices page (HIPAA): a plain text page with the site's fonts and styling. Jess and the practice's attorney approve the text before it is published. Layout is fixed by the template; each top-level property is one zone. Header, footer and crisis line come from site settings.
 */
export interface NoticeOfPrivacyPractices {
  hero: Hero;
  body: Body;
  seo: SEO;
}
export interface Hero {
  eyebrow: string;
  /**
   * The page's only H1.
   */
  heading: string;
  /**
   * The notice's effective date, shown under the heading.
   */
  lastUpdated?: string;
}
export interface Body {
  /**
   * Use H2 and H3 only; the heading above is the H1.
   */
  content: string;
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
