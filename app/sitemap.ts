import type { MetadataRoute } from "next";
import { getContent, type PageId } from "@/lib/content";
import { listPosts } from "@/lib/content/blog";
import { siteUrl } from "@/lib/site";

// Singleton pages and their routes. The booking page is left out until it exists.
const pages: { id: PageId; path: string }[] = [
  { id: "home", path: "/" },
  { id: "our-approach", path: "/our-approach" },
  { id: "what-to-expect", path: "/what-to-expect" },
  { id: "featured-in", path: "/featured-in" },
  { id: "blog", path: "/blog" },
  { id: "reviews", path: "/reviews" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = getContent();

  const pageEntries = (
    await Promise.all(
      pages.map(async ({ id, path }) => {
        const page = await content.getPage(id);
        return page && !page.seo?.noindex ? { url: `${siteUrl}${path}` } : null;
      }),
    )
  ).filter((e): e is { url: string } => e !== null);

  const collection = async (name: "clinicians" | "specialties", base: string) => {
    const slugs = await content.listSlugs(name);
    const entries = await Promise.all(
      slugs.map(async (slug) => {
        const entry = await content.getEntry(name, slug);
        return entry && !entry.seo?.noindex ? { url: `${siteUrl}${base}/${slug}` } : null;
      }),
    );
    return entries.filter((e): e is { url: string } => e !== null);
  };

  const posts = (await listPosts(content)).map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: p.publishDate,
  }));

  return [
    ...pageEntries,
    ...(await collection("specialties", "/specialties")),
    ...(await collection("clinicians", "/clinicians")),
    ...posts,
  ];
}
