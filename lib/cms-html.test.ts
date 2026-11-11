import { describe, expect, it } from "vitest";
import { cleanCmsHtml } from "@/components/CmsHtml";
import { cmsImageUrl } from "@/components/ui";

describe("cleanCmsHtml", () => {
  it("keeps paragraphs and simple formatting", () => {
    expect(cleanCmsHtml("<p>One <strong>two</strong></p><p>Three</p>")).toBe("<p>One <strong>two</strong></p><p>Three</p>");
  });

  it("drops scripts, styles and event handlers", () => {
    expect(cleanCmsHtml('<p onclick="x()">Hi</p><script>alert(1)</script><img src=x onerror=alert(1)>')).toBe("<p>Hi</p>");
  });

  it("blocks javascript links and opens external links safely", () => {
    expect(cleanCmsHtml('<a href="javascript:alert(1)">x</a>')).toBe("<a>x</a>");
    expect(cleanCmsHtml('<a href="https://example.com">x</a>')).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">x</a>',
    );
  });

  it("wraps plain text in 1 paragraph and escapes it", () => {
    expect(cleanCmsHtml("Plain text & more")).toBe("<p>Plain text &amp; more</p>");
  });
});

describe("cmsImageUrl", () => {
  it("builds the CloudFront URL for an uploaded image", () => {
    expect(cmsImageUrl("uploads/5b4bef64-c04c-47f5-bd12-a35123a3b561.png")).toBe(
      "https://cms.uptherapygroup.com/uploads/5b4bef64-c04c-47f5-bd12-a35123a3b561.png",
    );
  });

  it("returns null for a placeholder or an odd key", () => {
    expect(cmsImageUrl("[asset-id]")).toBeNull();
    expect(cmsImageUrl("uploads/../secret.png")).toBeNull();
  });
});
