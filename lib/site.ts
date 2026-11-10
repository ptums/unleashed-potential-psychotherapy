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
  bookHref: "/clinicians/jess-rebelo",
  nav: [
    {
      label: "Our Mission",
      links: [
        { label: "Our Approach", href: "/our-approach" },
        { label: "Our Clinicians", href: "/clinicians/jess-rebelo" },
        { label: "Featured In", href: "/featured-in" },
      ],
    },
    {
      label: "Specialties",
      links: [
        { label: "What We Treat", href: "/#specialties" },
        { label: "How We Help", href: "/specialties/emdr" },
      ],
    },
    {
      label: "Experience",
      links: [{ label: "What to Expect", href: "/what-to-expect" }],
    },
  ] satisfies NavGroup[],
  navLinks: [{ label: "Blog", href: "/blog" }] satisfies NavLink[],
  footerLinks: [{ label: "Our Clinicians", href: "/clinicians/jess-rebelo" }] satisfies NavLink[],
  // TODO(handoff open question 7): real address and social links.
  address: ["[Street address]", "[City, State ZIP]"],
  social: [] as NavLink[],
};
