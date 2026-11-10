/* Generated from schemas/featured-in.json by scripts/gen-types.mjs. Do not edit. */

/**
 * Content for the Featured In (podcasts & press) page. Episode titles, outlets and platform links come from Media Appearance entries. Layout is fixed by the template; each top-level property is one zone. Header, footer and crisis line come from site settings.
 */
export interface FeaturedIn {
  hero: Hero;
  featuredEpisode: FeaturedEpisode;
  appearances: AllAppearances;
  pressCta: PressSpeaking;
  seo: SEO;
}
/**
 * The outlet names under the intro are taken from the appearances zone.
 */
export interface Hero {
  eyebrow: string;
  /**
   * The page's only H1.
   */
  heading: string;
  intro: string;
}
export interface FeaturedEpisode {
  hidden: boolean;
  appearance: Reference;
  /**
   * The outlet name is added after it automatically.
   */
  eyebrow: string;
  /**
   * Overrides the appearance's own summary when filled.
   */
  summary?: string;
  image: Image;
  listenLabel: string;
}
/**
 * A Media Appearance entry. Its title, outlet and platform links are shown here.
 */
export interface Reference {
  collection: "pages" | "clinicians" | "specialties" | "mediaAppearances" | "blogPosts";
  id: string;
}
/**
 * Video still or episode art (16:9). Links to the video; never autoplays.
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
export interface AllAppearances {
  hidden: boolean;
  eyebrow: string;
  heading: string;
  /**
   * Listed in this order. Each shows type, outlet, title, summary and its platform links.
   *
   * @minItems 1
   * @maxItems 40
   */
  items: [Reference1, ...Reference1[]];
}
export interface Reference1 {
  collection: "pages" | "clinicians" | "specialties" | "mediaAppearances" | "blogPosts";
  id: string;
}
export interface PressSpeaking {
  hidden: boolean;
  heading: string;
  body?: string;
  email: string;
  cta?: Link;
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
