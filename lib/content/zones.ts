/**
 * A zone renders only when it has content and is not hidden.
 * Empty means: missing, null, not an object, or an object with no fields other than `hidden`.
 */
export function isZoneVisible<T>(zone: T | null | undefined): zone is NonNullable<T> {
  if (zone === null || zone === undefined || typeof zone !== "object") {
    return false;
  }
  const record = zone as Record<string, unknown>;
  if (record.hidden === true) {
    return false;
  }
  return Object.keys(record).some((key) => key !== "hidden");
}
