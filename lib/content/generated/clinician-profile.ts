/* Generated from schemas/clinician-profile.json by scripts/gen-types.mjs. Do not edit. */

/**
 * One entry per clinician. Layout is fixed by the template; each top-level property is one zone. Open appointment times are fetched live from the scheduling system using the booking zone; they are not stored here. Header, footer and crisis line come from site settings.
 */
export interface ClinicianProfile {
  profileHeader: ProfileHeader;
  booking: BookingCard;
  approach: Approach;
  credentials: Credentials;
  fees: FeesInsurance;
  featuredIn: FeaturedIn;
  closingCta: ClosingCallToAction;
  seo: SEO;
}
export interface ProfileHeader {
  /**
   * Name with credentials, e.g. Jess Rebelo, LCSW. The page's only H1.
   */
  displayName: string;
  /**
   * Used in labels such as Book with {firstName}.
   */
  firstName: string;
  /**
   * Small caps line above the name, e.g. Founder · Licensed Clinical Social Worker.
   */
  roleLine: string;
  portrait: Image;
  /**
   * Intro under the name. Also used on clinician cards.
   */
  summary: string;
  /**
   * e.g. Adults 18+
   */
  ages?: string;
  /**
   * Where and how they see clients, e.g. In person in [City] · Online in [State].
   */
  sessionsLine?: string;
  /**
   * @minItems 1
   * @maxItems 6
   */
  languages:
    | [string]
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string]
    | [string, string, string, string, string, string];
  /**
   * Shown as chips. Also lists this clinician on each specialty page.
   *
   * @minItems 1
   * @maxItems 8
   */
  specialties:
    | [Reference]
    | [Reference, Reference]
    | [Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference];
}
/**
 * Portrait (3:4).
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
export interface Reference {
  collection: "pages" | "clinicians" | "specialties" | "mediaAppearances" | "blogPosts";
  id: string;
}
/**
 * Booking starts only here. Keep hidden false unless the clinician is not taking clients at all.
 */
export interface BookingCard {
  hidden: boolean;
  /**
   * When false, the open times are replaced by the waitlist message.
   */
  acceptingNewClients: boolean;
  /**
   * Supports the {firstName} token.
   */
  heading: string;
  subhead?: string;
  slotsLabel?: string;
  slotsShown: number;
  ctaLabel: string;
  allTimesLabel?: string;
  waitlistMessage?: string;
  provider: "simplepractice" | "jane" | "acuity" | "calendly" | "custom";
  /**
   * Internal. Never rendered.
   */
  externalCalendarId: string;
  /**
   * Must match a key in the fees zone. Usually the free consultation.
   */
  defaultSessionTypeKey: string;
}
export interface Approach {
  hidden: boolean;
  heading: string;
  body: string;
}
export interface Credentials {
  hidden: boolean;
  heading: string;
  /**
   * @minItems 0
   * @maxItems 4
   */
  education?:
    | []
    | [
        {
          degree: string;
          institution: string;
          year?: number | null;
        }
      ]
    | [
        {
          degree: string;
          institution: string;
          year?: number | null;
        },
        {
          degree: string;
          institution: string;
          year?: number | null;
        }
      ]
    | [
        {
          degree: string;
          institution: string;
          year?: number | null;
        },
        {
          degree: string;
          institution: string;
          year?: number | null;
        },
        {
          degree: string;
          institution: string;
          year?: number | null;
        }
      ]
    | [
        {
          degree: string;
          institution: string;
          year?: number | null;
        },
        {
          degree: string;
          institution: string;
          year?: number | null;
        },
        {
          degree: string;
          institution: string;
          year?: number | null;
        },
        {
          degree: string;
          institution: string;
          year?: number | null;
        }
      ];
  /**
   * Shown publicly; many state boards require the license number.
   *
   * @minItems 1
   * @maxItems 5
   */
  licenses:
    | [
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        }
      ]
    | [
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        },
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        }
      ]
    | [
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        },
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        },
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        }
      ]
    | [
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        },
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        },
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        },
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        }
      ]
    | [
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        },
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        },
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        },
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        },
        {
          /**
           * e.g. LCSW, LMHC, LMFT
           */
          type: string;
          /**
           * Two-letter state code.
           */
          state: string;
          number: string;
        }
      ];
  /**
   * @minItems 0
   * @maxItems 8
   */
  trainings?:
    | []
    | [
        {
          name: string;
          provider?: string;
          year?: number | null;
        }
      ]
    | [
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        }
      ]
    | [
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        }
      ]
    | [
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        }
      ]
    | [
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        }
      ]
    | [
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        }
      ]
    | [
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        }
      ]
    | [
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        },
        {
          name: string;
          provider?: string;
          year?: number | null;
        }
      ];
  practicingSince?: number | null;
}
export interface FeesInsurance {
  hidden: boolean;
  heading: string;
  caption: string;
  /**
   * Rows of the fee table, in order.
   *
   * @minItems 1
   * @maxItems 6
   */
  sessionTypes:
    | [SessionType]
    | [SessionType, SessionType]
    | [SessionType, SessionType, SessionType]
    | [SessionType, SessionType, SessionType, SessionType]
    | [SessionType, SessionType, SessionType, SessionType, SessionType]
    | [SessionType, SessionType, SessionType, SessionType, SessionType, SessionType];
  insuranceStatus: "in_network" | "out_of_network" | "both" | "self_pay_only";
  insuranceNote?: string;
  superbills?: boolean;
  slidingScale?: boolean;
  /**
   * No Surprises Act notice for self-pay clients.
   */
  showGoodFaithEstimateNotice: boolean;
}
export interface SessionType {
  /**
   * Stable id used by booking, e.g. consultation.
   */
  key: string;
  label: string;
  minMinutes: number;
  /**
   * Set for a range, e.g. 60–75. Leave empty for a fixed length.
   */
  maxMinutes?: number | null;
  /**
   * Shown as typed, for example Free or $255.
   */
  price: string;
  /**
   * Offered in booking step 1.
   */
  bookableOnline: boolean;
  /**
   * @minItems 1
   * @maxItems 3
   */
  modes?:
    | ["in_person" | "video" | "phone"]
    | ["in_person" | "video" | "phone", "in_person" | "video" | "phone"]
    | ["in_person" | "video" | "phone", "in_person" | "video" | "phone", "in_person" | "video" | "phone"];
}
export interface FeaturedIn {
  hidden: boolean;
  heading: string;
  /**
   * @minItems 1
   * @maxItems 10
   */
  appearances:
    | [Reference]
    | [Reference, Reference]
    | [Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference]
    | [Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference, Reference];
  allLink?: Link;
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
export interface ClosingCallToAction {
  hidden: boolean;
  /**
   * Leave empty to show the next open time, e.g. Next open: Thu, Oct 29 · 10:00 AM.
   */
  heading?: string | null;
  body?: string;
  ctaLabel: string;
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
