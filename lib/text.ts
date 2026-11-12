/**
 * Cuts text to at most `max` characters, "..." included. A cut ends on a whole word.
 * Shorter text is only trimmed.
 */
export function truncateChars(text: string, max: number): string {
  const clean = text.trim();
  if (clean.length <= max) {
    return clean;
  }
  const room = clean.slice(0, max - 3);
  const lastSpace = room.lastIndexOf(" ");
  const cut = lastSpace > 0 ? room.slice(0, lastSpace) : room;
  // No dangling comma or period before the "...".
  return `${cut.replace(/[\s,.;:!?]+$/, "")}...`;
}
