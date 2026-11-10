/* Generated from schemas/what-to-expect.json by scripts/gen-types.mjs. Do not edit. */

/**
 * Content for the What to Expect page. Layout is fixed by the template; each top-level property is one zone. Header, footer and crisis line come from site settings.
 */
export interface WhatToExpect {
  hero: Hero;
  steps: Steps;
  formats: InPersonOnline;
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
export interface Steps {
  hidden: boolean;
  /**
   * Numbered automatically, with a Step n of N label.
   *
   * @minItems 2
   * @maxItems 5
   */
  items: [Step, Step] | [Step, Step, Step] | [Step, Step, Step, Step] | [Step, Step, Step, Step, Step];
}
export interface Step {
  title: string;
  body: string;
  /**
   * Short label and value pairs, e.g. Length · 15 minutes.
   *
   * @minItems 1
   * @maxItems 4
   */
  facts:
    | [
        {
          label: string;
          value: string;
        }
      ]
    | [
        {
          label: string;
          value: string;
        },
        {
          label: string;
          value: string;
        }
      ]
    | [
        {
          label: string;
          value: string;
        },
        {
          label: string;
          value: string;
        },
        {
          label: string;
          value: string;
        }
      ]
    | [
        {
          label: string;
          value: string;
        },
        {
          label: string;
          value: string;
        },
        {
          label: string;
          value: string;
        },
        {
          label: string;
          value: string;
        }
      ];
}
export interface InPersonOnline {
  hidden: boolean;
  eyebrow: string;
  heading: string;
  body: string;
  image: Image;
  link?: Link;
}
/**
 * Landscape photo (4:3).
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
export interface ClosingCallToAction {
  hidden: boolean;
  heading: string;
  body?: string;
  cta: Link1;
}
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
