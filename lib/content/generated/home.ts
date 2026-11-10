/* Generated from schemas/home.json by scripts/gen-types.mjs. Do not edit. */

/**
 * Content for the Home page. Layout is fixed by the template; each top-level property is one zone. Header, footer and crisis line come from site settings.
 */
export interface Home {
  hero: Hero;
  featuredIn: FeaturedInStrip;
  specialties: SpecialtiesGrid;
  clinicians: Clinicians;
  howItWorks: HowItWorks;
  approachBand: ApproachStatementBand;
  seo: SEO;
}
export interface Hero {
  /**
   * Small caps line above the heading. Keep it short so it wraps cleanly on mobile.
   */
  eyebrow: string;
  /**
   * The page's only H1.
   */
  heading: string;
  /**
   * Intro paragraph under the heading.
   */
  body: string;
  primaryCta: Link;
  secondaryLink?: Link1;
  /**
   * Short facts joined with a middle dot, e.g. Free 15-minute consultation.
   *
   * @minItems 0
   * @maxItems 4
   */
  trustLine?: [] | [string] | [string, string] | [string, string, string] | [string, string, string, string];
  image: Image;
}
/**
 * Outlined button. Must go to the clinicians list or a profile, never straight to booking.
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
/**
 * Portrait-format photo (4:5).
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
export interface FeaturedInStrip {
  hidden: boolean;
  label: string;
  /**
   * Each shows its outlet name, linked to its main URL.
   *
   * @minItems 1
   * @maxItems 6
   */
  appearances:
    | [Reference]
    | [Reference, Reference]
    | [Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference];
  allLink: Link2;
}
export interface Link2 {
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
export interface SpecialtiesGrid {
  hidden: boolean;
  eyebrow: string;
  heading: string;
  /**
   * Tiles use each specialty's name and tile summary. A tile links only if its specialty page is published.
   *
   * @minItems 1
   * @maxItems 9
   */
  items:
    | [Reference]
    | [Reference, Reference]
    | [Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference];
  tileLinkLabel: string;
}
export interface Clinicians {
  hidden: boolean;
  eyebrow: string;
  heading: string;
  intro?: string;
  /**
   * auto shows every published clinician accepting new clients, in their sort order. manual shows the list below.
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
  limit: number;
  /**
   * Card button always opens the clinician's profile. Next open date is fetched live.
   */
  cardCtaLabel: string;
  /**
   * Card shown beside the clinicians while the team is growing.
   */
  recruitingCard: {
    hidden: boolean;
    heading: string;
    body: string;
    link: Link3;
  };
}
export interface Link3 {
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
export interface HowItWorks {
  hidden: boolean;
  eyebrow: string;
  heading: string;
  /**
   * Numbered automatically (01, 02, …).
   *
   * @minItems 2
   * @maxItems 5
   */
  steps:
    | [TitledText, TitledText]
    | [TitledText, TitledText, TitledText]
    | [TitledText, TitledText, TitledText, TitledText]
    | [TitledText, TitledText, TitledText, TitledText, TitledText];
  moreLink: Link4;
}
export interface TitledText {
  title: string;
  body: string;
}
export interface Link4 {
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
export interface ApproachStatementBand {
  hidden: boolean;
  eyebrow: string;
  /**
   * Large italic statement on the dark band. Not a client testimonial.
   */
  statement: string;
  cta: Link5;
}
export interface Link5 {
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
