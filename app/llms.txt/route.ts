import { getContent } from "@/lib/content";
import { listPosts } from "@/lib/content/blog";
import { site, siteUrl } from "@/lib/site";

// /llms.txt (https://llmstxt.org): a plain Markdown guide to the site for AI tools (UPTG-30).
// It is built from the same CMS content as the pages, at deploy time, like the sitemap.
// A CMS publish starts a deploy, so the file stays current.
export const dynamic = "force-static";

const link = (label: string, path: string, note?: string) => `- [${label}](${siteUrl}${path})${note ? `: ${note}` : ""}`;

export async function GET() {
  const content = getContent();

  const specialtySlugs = await content.listSlugs("specialties");
  const specialties = (await Promise.all(specialtySlugs.map((slug) => content.getSpecialtyTile(slug)))).filter(
    (t) => t !== null,
  );

  const clinicianSlugs = await content.listSlugs("clinicians");
  const clinicians = (
    await Promise.all(clinicianSlugs.map(async (slug) => ({ slug, profile: await content.getEntry("clinicians", slug) })))
  ).filter((c) => c.profile !== null && !c.profile.seo?.noindex);

  const posts = await listPosts(content);

  const lines = [
    `# ${site.name}`,
    "",
    "> A trauma-informed psychotherapy practice in Commack, Long Island, NY, founded by Jessica Rebelo, LCSW. " +
      "Evidence-based therapy, including EMDR, for trauma, grief, relationships and life transitions. " +
      "Sessions in person and by video. A free 15-minute consultation can be booked online.",
    "",
    `Address: ${site.address.join(", ")}. In a crisis, call or text 988 or call 911; the practice is not an emergency service.`,
    "",
    "## Start here",
    link("Home", "/", "who the practice helps and how to begin"),
    link("Our approach", "/our-approach", "the practice's mission and standard of care"),
    link("What to expect", "/what-to-expect", "the steps from a first call to ongoing sessions"),
    link("Book a free consultation", site.bookHref, "request a 15-minute call with Jessica Rebelo"),
    "",
    "## Clinicians",
    ...clinicians.map((c) => link(c.profile!.profileHeader.displayName, `/clinicians/${c.slug}`, "profile, fees, insurance and booking")),
    "",
    "## Specialties",
    ...specialties.map((t) => link(t.name, `/specialties/${t.slug}`, t.summary)),
    "",
    "## Blog",
    ...posts.map((p) => link(p.heading, `/blog/${p.slug}`, p.dek)),
    "",
    "## Optional",
    link("Client reviews", "/reviews"),
    link("Podcasts & press", "/featured-in"),
    link("Disclaimer", "/disclaimer"),
    link("Privacy policy", "/privacy-policy"),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
