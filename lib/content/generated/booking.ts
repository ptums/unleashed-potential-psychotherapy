/* Generated from schemas/booking.json by scripts/gen-types.mjs. Do not edit. */

/**
 * Copy for the 3-step booking flow. Times, clinician, session types and fees come from the clinician entry and the scheduling system, not from here. Only one step shows at a time; the visible step's heading is the page's H1. Header, footer and crisis line come from site settings.
 */
export interface Booking {
  stepTime: Step1Time;
  stepDetails: Step2Details;
  stepConfirmed: Step3Confirmation;
  summaryPanel: BookingSummaryPanel;
  seo: SEO;
}
export interface Step1Time {
  progressLabel: string;
  /**
   * The page's only H1.
   */
  heading: string;
  intro?: string;
  slotsLegend: string;
  formatLegend: string;
  videoLabel: string;
  phoneLabel: string;
  continueLabel: string;
}
/**
 * Required for booking. Keep hidden false.
 */
export interface Step2Details {
  hidden: boolean;
  progressLabel: string;
  /**
   * Becomes the H1 while this step is shown.
   */
  heading: string;
  intro?: string;
  nameLabel: string;
  emailLabel: string;
  emailHint?: string;
  phoneLabel: string;
  payLegend: string;
  payOptions: {
    selfPay: string;
    insurance: string;
    unsure: string;
  };
  /**
   * Checkbox text. Must mention that the practice is not an emergency service and point to 988.
   */
  consentText: string;
  /**
   * Shown as text under each field. Each starts with Error: so it is not signaled by color alone.
   */
  errors: {
    summary: string;
    name: string;
    email: string;
    phone: string;
    consent: string;
  };
  submitLabel: string;
  backLabel: string;
}
/**
 * Required for booking. Keep hidden false.
 */
export interface Step3Confirmation {
  hidden: boolean;
  progressLabel: string;
  /**
   * Becomes the H1 while this step is shown.
   */
  heading: string;
  /**
   * Tokens: {firstName}, {time}, {format}.
   */
  summary: string;
  calendarHeading: string;
  calendarLabels: {
    google: string;
    apple: string;
    outlook: string;
  };
  nextStepsHeading: string;
  /**
   * Tokens: {email}, {firstName}, {phone}.
   *
   * @minItems 1
   * @maxItems 5
   */
  nextSteps:
    | [string]
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string];
  changePolicy: string;
  homeLink: Link;
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
/**
 * Shows the chosen clinician and time on every step. Keep hidden false.
 */
export interface BookingSummaryPanel {
  hidden: boolean;
  heading: string;
  rowLabels: {
    session: string;
    time: string;
    format: string;
    cost: string;
  };
  changeLabel: string;
  /**
   * Link in the booking header.
   */
  exitLabel: string;
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
