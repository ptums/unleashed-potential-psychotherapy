import { describe, expect, it, vi } from "vitest";

// The Home hero is the fallback share image.
vi.mock("./content", async (orig) => {
  const actual = await orig<typeof import("./content")>();
  return {
    ...actual,
    getContent: () => ({
      getPage: async () => ({ hero: { image: { assetId: "uploads/00000000-0000-4000-8000-000000000001.png", alt: "Home hero" } } }),
    }),
  };
});
const { seoMetadata } = await import("./seo");

const seo = { title: "Finding Your Ground", description: "Four grounding techniques." };
const pageImage = { assetId: "uploads/00000000-0000-4000-8000-000000000002.webp", alt: "Stones on a cushion" };
const cmsShare = { assetId: "uploads/00000000-0000-4000-8000-000000000003.jpg", alt: "Share card" };
const url = (id: string) => `https://cms.uptherapygroup.com/uploads/00000000-0000-4000-8000-00000000000${id}`;

describe("seoMetadata share tags", () => {
  it("uses the page's own image, with a large Twitter card, the canonical and og:url", async () => {
    const m = await seoMetadata(seo, { path: "/blog/finding-your-ground", image: pageImage });
    expect(m.openGraph).toMatchObject({
      title: seo.title,
      description: seo.description,
      url: "https://uptherapygroup.com/blog/finding-your-ground",
      siteName: "Unleashed Potential Psychotherapy",
      images: [{ url: `${url("2")}.webp`, alt: "Stones on a cushion" }],
    });
    expect(m.twitter).toMatchObject({ card: "summary_large_image", images: [{ url: `${url("2")}.webp` }] });
    expect(m.alternates).toEqual({ canonical: "https://uptherapygroup.com/blog/finding-your-ground" });
  });

  it("prefers the CMS share image over the page image", async () => {
    const m = await seoMetadata({ ...seo, ogImage: cmsShare }, { path: "/", image: pageImage });
    expect(m.openGraph?.images).toEqual([{ url: `${url("3")}.jpg`, alt: "Share card" }]);
  });

  it("falls back to the Home hero for a page with no image, or a placeholder image", async () => {
    for (const image of [undefined, { assetId: "[asset-id]", alt: "placeholder" }]) {
      const m = await seoMetadata(seo, { path: "/blog", image });
      expect(m.openGraph?.images).toEqual([{ url: `${url("1")}.png`, alt: "Home hero" }]);
    }
  });

  it("marks a blog post as an article with its date and author", async () => {
    const m = await seoMetadata(seo, { path: "/blog/x", image: pageImage, type: "article", publishedTime: "2026-11-20", author: "Jessica Rebelo, LCSW" });
    expect(m.openGraph).toMatchObject({ type: "article", publishedTime: "2026-11-20", authors: ["Jessica Rebelo, LCSW"] });
  });

  it("returns nothing when the SEO zone is hidden or missing", async () => {
    expect(await seoMetadata(null, { path: "/" })).toEqual({});
  });
});
