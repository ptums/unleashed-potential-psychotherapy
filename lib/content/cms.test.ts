import { describe, expect, it } from "vitest";
import { normalizeReferences } from "./cms";
import { withFallback } from "./fallback";
import { mockRepository } from "./mock";
import { toPageId, toSlug } from "./slug";
import type { ContentRepository } from "./types";
import { getMediaAppearance } from "../media";

describe("slugs", () => {
  it("turns display names into the CMS slug", () => {
    expect(toSlug("Jess Rebelo")).toBe("jess-rebelo");
    expect(toSlug("Trauma & PTSD")).toBe("trauma-ptsd");
    expect(toSlug("jess-rebelo")).toBe("jess-rebelo");
  });

  it("turns a route into a page id", () => {
    expect(toPageId("/what-to-expect")).toBe("what-to-expect");
    expect(toPageId("featured-in")).toBe("featured-in");
    expect(toPageId("/")).toBe("home");
  });
});

describe("normalizeReferences", () => {
  it("cleans every reference id and leaves other fields alone", () => {
    const page = {
      title: "Home",
      clinicians: { clinicians: [{ collection: "clinicians", id: "Jess Rebelo" }], heading: "Jess Rebelo" },
      howItWorks: { moreLink: { target: { internal: { collection: "pages", id: "/what-to-expect" } } } },
    };
    expect(normalizeReferences(page)).toEqual({
      title: "Home",
      clinicians: { clinicians: [{ collection: "clinicians", id: "jess-rebelo" }], heading: "Jess Rebelo" },
      howItWorks: { moreLink: { target: { internal: { collection: "pages", id: "what-to-expect" } } } },
    });
  });
});

describe("withFallback", () => {
  const empty: ContentRepository = {
    getPage: async () => null,
    getEntry: async () => null,
    listSlugs: async () => [],
    getSpecialtyTile: async () => null,
  };

  it("uses the mock for content the CMS has not published", async () => {
    const repo = withFallback(empty, mockRepository);
    expect(await repo.getPage("our-approach")).not.toBeNull();
    expect(await repo.getEntry("clinicians", "jessica-rebelo")).not.toBeNull();
    expect(await repo.listSlugs("clinicians")).toEqual(["jessica-rebelo"]);
  });

  it("never uses mock blog posts", async () => {
    const repo = withFallback(empty, mockRepository);
    expect(await repo.listSlugs("blogPosts")).toEqual([]);
    expect(await repo.getEntry("blogPosts", "grief-without-a-timeline")).toBeNull();
  });

  it("never uses mock specialty pages, but keeps their names", async () => {
    const repo = withFallback(empty, mockRepository);
    expect(await repo.listSlugs("specialties")).toEqual([]);
    expect(await repo.getEntry("specialties", "emdr")).toBeNull();
    expect(await repo.getSpecialtyTile("emdr")).toMatchObject({ slug: "emdr", hasPage: false });
  });

  it("prefers the CMS when it has the content", async () => {
    const cms: ContentRepository = { ...empty, getPage: async () => ({ title: "From CMS" }) as never };
    const page = (await withFallback(cms, mockRepository).getPage("home")) as unknown as { title: string };
    expect(page.title).toBe("From CMS");
  });
});

describe("media references", () => {
  it("finds an appearance by its outlet name", () => {
    expect(getMediaAppearance("Female Founders Podcast")?.id).toBe("female-founders-ep-77");
  });
});
