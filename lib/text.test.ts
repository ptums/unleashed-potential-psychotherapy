import { describe, expect, it } from "vitest";
import { truncateChars } from "./text";

describe("truncateChars", () => {
  it("keeps text at or under the limit", () => {
    expect(truncateChars("  short text  ", 20)).toBe("short text");
  });

  it("cuts on a whole word and ends with ...", () => {
    expect(truncateChars("one two three four", 12)).toBe("one two...");
  });

  it("never goes over the limit", () => {
    const long = "word ".repeat(200);
    expect(truncateChars(long, 400).length).toBeLessThanOrEqual(400);
  });

  it("drops a comma before the ...", () => {
    expect(truncateChars("one two, three four", 12)).toBe("one two...");
  });
});
