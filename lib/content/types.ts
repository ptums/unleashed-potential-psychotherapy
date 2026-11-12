import type { Home } from "./generated/home";
import type { OurApproach } from "./generated/our-approach";
import type { WhatToExpect } from "./generated/what-to-expect";
import type { FeaturedIn } from "./generated/featured-in";
import type { Blog } from "./generated/blog";
import type { Booking } from "./generated/booking";
import type { ClinicianProfile } from "./generated/clinician-profile";
import type { Specialty } from "./generated/specialty";
import type { BlogPost } from "./generated/blog-post";
import type { ClientReviews } from "./generated/reviews";
import type { ShareYourExperience } from "./generated/share-experience";

export type { Home, OurApproach, WhatToExpect, FeaturedIn, Blog, Booking, ClinicianProfile, Specialty, BlogPost, ClientReviews, ShareYourExperience };

/** Singleton pages, keyed by their CMS page id (GET /pages/{id}). */
export interface PageMap {
  home: Home;
  "our-approach": OurApproach;
  "what-to-expect": WhatToExpect;
  "featured-in": FeaturedIn;
  blog: Blog;
  booking: Booking;
  reviews: ClientReviews;
  "share-experience": ShareYourExperience;
}

export type PageId = keyof PageMap;

/** Collections whose entries are addressed by slug. */
export interface CollectionMap {
  clinicians: ClinicianProfile;
  specialties: Specialty;
  blogPosts: BlogPost;
}

export type CollectionName = keyof CollectionMap;

/** A reference from one entry to another, as stored in the CMS. */
export interface Reference {
  collection: "pages" | "clinicians" | "specialties" | "mediaAppearances" | "blogPosts";
  id: string;
}

export interface ContentRepository {
  getPage<K extends PageId>(id: K): Promise<PageMap[K] | null>;
  getEntry<C extends CollectionName>(collection: C, slug: string): Promise<CollectionMap[C] | null>;
  listSlugs(collection: CollectionName): Promise<string[]>;
  /** Name and summary for a specialty tile. `hasPage` is false when the specialty has no published page. */
  getSpecialtyTile(slug: string): Promise<SpecialtyTile | null>;
}

export interface SpecialtyTile {
  slug: string;
  name: string;
  summary: string;
  hasPage: boolean;
}
