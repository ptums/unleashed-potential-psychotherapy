import type { ClinicianProfile, ContentRepository, Reference, SpecialtyTile } from "./types";

export interface ClinicianListItem {
  slug: string;
  profile: ClinicianProfile;
}

/**
 * The clinicians a "clinicians" zone shows.
 * manual: the listed references, in order.
 * auto: every clinician accepting new clients, optionally only those with a given specialty.
 */
export async function resolveClinicians(
  content: ContentRepository,
  options: { mode: "auto" | "manual"; refs?: Reference[]; specialty?: string; limit?: number },
): Promise<ClinicianListItem[]> {
  const slugs =
    options.mode === "manual" ? (options.refs ?? []).map((ref) => ref.id) : await content.listSlugs("clinicians");

  const entries = await Promise.all(
    slugs.map(async (slug) => ({ slug, profile: await content.getEntry("clinicians", slug) })),
  );

  return entries
    .filter((e): e is ClinicianListItem => e.profile !== null)
    .filter((e) => options.mode === "manual" || e.profile.booking.acceptingNewClients)
    .filter(
      (e) =>
        !options.specialty ||
        options.mode === "manual" ||
        e.profile.profileHeader.specialties.some((ref) => ref.id === options.specialty),
    )
    .slice(0, options.limit ?? 12);
}

/** Display names of a clinician's specialties, in profile order. */
export async function specialtyNames(content: ContentRepository, profile: ClinicianProfile): Promise<string[]> {
  const tiles = await Promise.all(profile.profileHeader.specialties.map((ref) => content.getSpecialtyTile(ref.id)));
  return tiles.filter((t): t is SpecialtyTile => t !== null).map((t) => t.name);
}
