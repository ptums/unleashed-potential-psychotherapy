import type { CollectionMap, CollectionName, ContentRepository, PageId, PageMap } from "./types";

import home from "@/content/mock/pages/home.json";
import ourApproach from "@/content/mock/pages/our-approach.json";
import whatToExpect from "@/content/mock/pages/what-to-expect.json";
import featuredIn from "@/content/mock/pages/featured-in.json";
import blog from "@/content/mock/pages/blog.json";
import booking from "@/content/mock/pages/booking.json";
import jessRebelo from "@/content/mock/clinicians/jess-rebelo.json";
import emdr from "@/content/mock/specialties/emdr.json";
import groundingSkills from "@/content/mock/blogPosts/grounding-skills-between-sessions.json";
import emdrSession from "@/content/mock/blogPosts/what-happens-in-an-emdr-session.json";
import selfWorth from "@/content/mock/blogPosts/self-worth-and-relationships.json";
import grief from "@/content/mock/blogPosts/grief-without-a-timeline.json";
import specialtyTiles from "@/content/mock/specialty-tiles.json";

// Mock content from the Claude Design handoff. Imported statically so it is bundled into the
// Worker (there is no filesystem at runtime). The schema test checks every file here.
const pages = {
  home,
  "our-approach": ourApproach,
  "what-to-expect": whatToExpect,
  "featured-in": featuredIn,
  blog,
  booking,
} as unknown as PageMap;

const collections = {
  clinicians: { "jess-rebelo": jessRebelo },
  specialties: { emdr },
  blogPosts: {
    "grounding-skills-between-sessions": groundingSkills,
    "what-happens-in-an-emdr-session": emdrSession,
    "self-worth-and-relationships": selfWorth,
    "grief-without-a-timeline": grief,
  },
} as unknown as { [C in CollectionName]: Record<string, CollectionMap[C]> };

export const mockRepository: ContentRepository = {
  async getPage<K extends PageId>(id: K) {
    return pages[id] ?? null;
  },
  async getEntry<C extends CollectionName>(collection: C, slug: string) {
    return collections[collection][slug] ?? null;
  },
  async listSlugs(collection) {
    return Object.keys(collections[collection]);
  },
  async getSpecialtyTile(slug) {
    const entry = collections.specialties[slug];
    if (entry) {
      return { slug, name: entry.hero.heading, summary: entry.hero.tileSummary, hasPage: true };
    }
    // Specialties named in the design that have no page yet.
    const stub = (specialtyTiles as Record<string, { name: string; summary: string }>)[slug];
    return stub ? { slug, ...stub, hasPage: false } : null;
  },
};
