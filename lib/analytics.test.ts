import { describe, expect, it } from "vitest";
import { UNTRACKED_PATH_PATTERN, isUntrackedPath } from "./analytics";

describe("isUntrackedPath", () => {
  it("leaves out the form pages and anything under them", () => {
    for (const path of ["/book", "/book/", "/book?clinician=jessica-rebelo", "/reviews/share", "/reviews/share/"]) {
      expect(isUntrackedPath(path)).toBe(true);
    }
  });

  it("tracks every other page, including ones that only start with the same letters", () => {
    for (const path of ["/", "/reviews", "/blog/finding-your-ground", "/bookings", "/booklet", "/reviews/shared"]) {
      expect(isUntrackedPath(path)).toBe(false);
    }
  });

  it("gives the inline script the same rule", () => {
    const re = new RegExp(UNTRACKED_PATH_PATTERN);
    expect(re.test("/book")).toBe(true);
    expect(re.test("/reviews/share")).toBe(true);
    expect(re.test("/reviews")).toBe(false);
  });
});
