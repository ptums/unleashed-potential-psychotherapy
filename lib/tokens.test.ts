import { describe, expect, it } from "vitest";
import { fillTokens } from "./tokens";

describe("fillTokens", () => {
  it("fills known tokens", () => {
    expect(fillTokens("Book with {firstName}", { firstName: "Jess" })).toBe("Book with Jess");
  });

  it("leaves unknown tokens as they are", () => {
    expect(fillTokens("{count} open times", {})).toBe("{count} open times");
  });
});
