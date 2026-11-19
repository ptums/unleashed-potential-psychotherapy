/* Generated from schemas/disclaimer.json by scripts/gen-types.mjs. Do not edit. */

/**
 * Content for the Disclaimer page: a plain text page with the site's fonts and styling. Layout is fixed by the template; each top-level property is one zone. Header, footer and crisis line come from site settings.
 */
export interface Disclaimer {
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
   * Shown under the heading as "Last updated".
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
