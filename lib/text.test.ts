import { describe, expect, it } from "vitest";
import { truncateWords } from "./text";

describe("truncateWords", () => {
  it("keeps text at or under the limit", () => {
    expect(truncateWords("one two three", 3)).toBe("one two three");
  });

  it("cuts long text and ends it with ...", () => {
    expect(truncateWords("one two three four", 2)).toBe("one two...");
  });

  it("counts words across extra spaces", () => {
    expect(truncateWords("one  two   three", 2)).toBe("one two...");
  });
});
