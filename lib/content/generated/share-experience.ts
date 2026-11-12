/* Generated from schemas/share-experience.json by scripts/gen-types.mjs. Do not edit. */

/**
 * Copy for the private review form for current and past clients. Submissions go to the practice and are never published automatically. Header, footer and crisis line come from site settings.
 */
export interface ShareYourExperience {
  form: ReviewForm;
  notePanel: BeforeYouWritePanel;
  thankYou: ThankYouState;
  seo: SEO;
}
export interface ReviewForm {
  eyebrow: string;
  /**
   * The page's only H1.
   */
  heading: string;
  intro?: string;
  labels: {
    name: string;
    email: string;
    phone: string;
    requiredMark: string;
    ratingLegend: string;
    ratingOptions: {
      excellent: string;
      good: string;
      disappointing: string;
    };
    likedBest: string;
    improve: string;
    recommendLegend: string;
    recommendOptions: {
      yes: string;
      no: string;
    };
    anythingElse: string;
    /**
     * Optional checkbox. When ticked, the submission is flagged as publishable; staff still decide.
     */
    publishConsent: string;
  };
  /**
   * Shown as text under each field, starting with Error:.
   */
  errors: {
    summary: string;
    name: string;
    email: string;
  };
  submitLabel: string;
  /**
   * Returns to the reviews page.
   */
  cancelLabel: string;
}
export interface BeforeYouWritePanel {
  hidden: boolean;
  heading: string;
  /**
   * @minItems 1
   * @maxItems 5
   */
  items:
    | [string]
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string];
  /**
   * 988 and 911 render as tel: links.
   */
  crisisText: string;
}
/**
 * Required. Keep hidden false.
 */
export interface ThankYouState {
  hidden: boolean;
  /**
   * Becomes the H1 after a successful submit.
   */
  heading: string;
  body: string;
  primaryLink: Link;
  secondaryLink?: Link1;
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
