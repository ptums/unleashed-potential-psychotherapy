// Header, footer and crisis line content.
// TODO(TWS-117 open question 1): hardcoded for launch. Move to a CMS site-settings schema later.
// Nav items for pages that are not designed yet (Careers, Who We Work With, In Person & Online,
// Fees & Insurance, FAQs, Contact) are left out until those pages exist.

/** Public site origin, used for the sitemap, robots and absolute metadata URLs. */
export const siteUrl = (process.env.SITE_URL ?? "https://uptherapygroup.com").replace(/\/+$/, "");

export interface NavLink {
  label: string;
  href: string;
  /** A CMS page id. The link shows only once that page is published (see SiteFooter). */
  pageId?: string;
  /** A link to another site. It opens in a new tab. */
  external?: boolean;
}

/** A titled list inside a nav menu, for example "Therapists" in the Clinicians menu. */
export interface NavSection {
  label: string;
  links: NavLink[];
}

export interface NavGroup {
  label: string;
  links: NavLink[];
  /** Titled lists. A menu with sections shows them in place of its plain links. */
  sections?: NavSection[];
}

export const site = {
  name: "Unleashed Potential Psychotherapy",
  // TODO(handoff open question 4): tagline wording is not final.
  tagline: "turning pain into power",
  // The header's calendar icon opens booking with Jess (Peter, 2026-11-12).
  bookHref: "/book?clinician=jessica-rebelo",
  nav: [
    {
      label: "Our Mission",
      links: [
        { label: "Our Approach", href: "/our-approach" },
        { label: "Featured In", href: "/featured-in" },
      ],
    },
    // Filled from the CMS (lib/nav.ts): Therapists are the published clinicians, and Trusted
    // Referrals come from the CMS "Trusted Referrals" section (Peter, 2026-11-23).
    {
      label: "Clinicians",
      links: [],
    },
    {
      label: "Specialties",
      links: [
        { label: "What We Treat", href: "/#specialties" },
      ],
    },
    {
      label: "Experience",
      links: [
        { label: "What to Expect", href: "/what-to-expect" },
        { label: "Reviews", href: "/reviews" },
      ],
    },
  ] as NavGroup[],
  navLinks: [{ label: "Blog", href: "/blog" }] satisfies NavLink[],
  footerLinks: [
    { label: "Our Clinicians", href: "/clinicians/jessica-rebelo" },
    { label: "Disclaimer", href: "/disclaimer" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Notice of Privacy Practices", href: "/notice-of-privacy-practices", pageId: "notice-of-privacy-practices" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ] as NavLink[],
  // TODO(handoff open question 7): social links.
  address: ["169 Commack Road #1015", "Commack, NY 11725"],
  social: [] as NavLink[],
};
