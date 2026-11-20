// Pages where analytics must not run (UPTG-38, compliance sweep). Their forms collect client details,
// and Google does not cover Analytics under a HIPAA BAA, so no analytics hit may come from them.
const UNTRACKED_PREFIXES = ["/book", "/reviews/share"];

/**
 * The same rule as a regular expression source, for the inline script that runs before React does
 * (a visitor can land straight on a form page). Matches the prefix itself or any page under it.
 */
export const UNTRACKED_PATH_PATTERN = `^(${UNTRACKED_PREFIXES.map((p) => p.replace(/\//g, "\\/")).join("|")})(\\/|$)`;

/** True for a form page, or any page under one. Query strings and trailing slashes do not matter. */
export function isUntrackedPath(pathname: string): boolean {
  const path = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  return new RegExp(UNTRACKED_PATH_PATTERN).test(path);
}
