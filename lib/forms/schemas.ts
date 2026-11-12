import * as Yup from "yup";

// The site's forms, ported from jessrebelo.com (lib/forms/schemas.ts there). The browser and
// the server (/api/submit) validate with the same schema, so a field is defined in 1 place.
// "booking" joins this list with the booking form (TWS-108).

export const FORM_TYPES = ["feedback"] as const;
export type FormType = (typeof FORM_TYPES)[number];

export const isFormType = (value: unknown): value is FormType =>
  typeof value === "string" && (FORM_TYPES as readonly string[]).includes(value);

const MAX_SHORT = 200;
const MAX_LONG = 5000;

const longText = Yup.string().trim().max(MAX_LONG).default("");

// The error keys match form.errors in the CMS (share-experience), so the page shows the CMS copy.
export const feedbackSchema = Yup.object({
  name: Yup.string().trim().max(MAX_SHORT).required("name"),
  email: Yup.string().trim().email("email").max(320).required("email"),
  phone: Yup.string().trim().max(40).default(""),
  rating: Yup.string().oneOf(["", "excellent", "good", "disappointing"]).default(""),
  likedBest: longText,
  improve: longText,
  recommend: Yup.string().oneOf(["", "yes", "no"]).default(""),
  anythingElse: longText,
  publishConsent: Yup.boolean().default(false),
});

export type FeedbackValues = Yup.InferType<typeof feedbackSchema>;

export const formSchemas = { feedback: feedbackSchema } satisfies Record<FormType, Yup.AnySchema>;

export interface FormValues {
  feedback: FeedbackValues;
}
