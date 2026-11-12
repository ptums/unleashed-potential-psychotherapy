import { describe, expect, it } from "vitest";
import type { ContentRepository } from "./content";
import { getNav } from "./nav";

const tiles: Record<string, { name: string; hasPage: boolean }> = {
  "trauma-ptsd": { name: "Trauma & PTSD", hasPage: true },
  "emdr-therapy": { name: "EMDR therapy", hasPage: true },
  stub: { name: "No page", hasPage: false },
};

function repo(slugs: string[]): ContentRepository {
  return {
    getPage: async () => null,
    getEntry: async () => null,
    listSlugs: async () => slugs,
    getSpecialtyTile: async (slug) => (tiles[slug] ? { slug, summary: "", ...tiles[slug] } : null),
  };
}

describe("getNav", () => {
  it("lists every specialty page under Specialties, sorted by name", async () => {
    const nav = await getNav(repo(["trauma-ptsd", "stub", "emdr-therapy"]));
    expect(nav.find((g) => g.label === "Specialties")?.links).toEqual([
      { label: "EMDR therapy", href: "/specialties/emdr-therapy" },
      { label: "Trauma & PTSD", href: "/specialties/trauma-ptsd" },
    ]);
  });

  it("keeps the What We Treat link when there are no specialty pages", async () => {
    const nav = await getNav(repo([]));
    expect(nav.find((g) => g.label === "Specialties")?.links).toEqual([{ label: "What We Treat", href: "/#specialties" }]);
  });
});
