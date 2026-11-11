// The same slug rule as the CMS (unleashed-cms utils toSlug), so a reference that holds a
// display name ("Jess Rebelo", "Trauma & PTSD") still finds its entry ("jess-rebelo", "trauma-ptsd").
// A slug that is already a slug comes back unchanged.
export function toSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// A page id from a reference. Editors sometimes write the route ("/what-to-expect") as the id.
export function toPageId(id: string): string {
  const trimmed = id.replace(/^\/+|\/+$/g, "");
  return trimmed === "" ? "home" : trimmed;
}
