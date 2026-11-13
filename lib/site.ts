// Header, footer and crisis line content.
// TODO(TWS-117 open question 1): hardcoded for launch. Move to a CMS site-settings schema later.
// Nav items for pages that are not designed yet (Careers, Who We Work With, In Person & Online,
// Fees & Insurance, FAQs, Contact, Privacy Notice) are left out until those pages exist.

/** Public site origin, used for the sitemap, robots and absolute metadata URLs. */
export const siteUrl = (process.env.SITE_URL ?? "https://uptherapygroup.com").replace(/\/+$/, "");

export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
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
        { label: "Our Clinicians", href: "/clinicians/jessica-rebelo" },
        { label: "Featured In", href: "/featured-in" },
      ],
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
  ] satisfies NavGroup[],
  navLinks: [{ label: "Blog", href: "/blog" }] satisfies NavLink[],
  footerLinks: [{ label: "Our Clinicians", href: "/clinicians/jessica-rebelo" }] satisfies NavLink[],
  // TODO(handoff open question 7): social links.
  address: ["169 Commack Road #1015", "Commack, NY 11725"],
  social: [] as NavLink[],
};
