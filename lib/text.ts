/** Cuts text to at most `max` words. Longer text ends with "...". Whitespace inside is kept as is. */
export function truncateWords(text: string, max: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= max) {
    return text.trim();
  }
  return `${words.slice(0, max).join(" ")}...`;
}
