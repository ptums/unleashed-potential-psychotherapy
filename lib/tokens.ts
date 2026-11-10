/** Fills label tokens like {firstName} or {count}. A token with no value is left as is. */
export function fillTokens(text: string, values: Record<string, string | number | undefined>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}
