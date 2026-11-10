import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";
import { getContent, isZoneVisible } from "./index";

const schemaFor: Record<string, string> = {
  "pages/home.json": "home",
  "pages/our-approach.json": "our-approach",
  "pages/what-to-expect.json": "what-to-expect",
  "pages/featured-in.json": "featured-in",
  "pages/blog.json": "blog",
  "pages/booking.json": "booking",
  clinicians: "clinician-profile",
  specialties: "specialty",
  blogPosts: "blog-post",
};

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8"));

describe("mock content", () => {
  for (const [key, schemaName] of Object.entries(schemaFor)) {
    const validate = ajv.compile(readJson(join("schemas", `${schemaName}.json`)));
    const files = key.endsWith(".json")
      ? [key]
      : readdirSync(join("content/mock", key)).map((f) => `${key}/${f}`);

    for (const file of files) {
      it(`${file} matches the ${schemaName} schema`, () => {
        const ok = validate(readJson(join("content/mock", file)));
        expect(validate.errors ?? []).toEqual([]);
        expect(ok).toBe(true);
      });
    }
  }
});

describe("isZoneVisible", () => {
  it("hides missing, null and empty zones", () => {
    expect(isZoneVisible(undefined)).toBe(false);
    expect(isZoneVisible(null)).toBe(false);
    expect(isZoneVisible({})).toBe(false);
    expect(isZoneVisible({ hidden: false })).toBe(false);
  });

  it("hides a zone with hidden: true", () => {
    expect(isZoneVisible({ hidden: true, heading: "Hi" })).toBe(false);
  });

  it("shows a zone with content", () => {
    expect(isZoneVisible({ heading: "Hi" })).toBe(true);
    expect(isZoneVisible({ hidden: false, heading: "Hi" })).toBe(true);
  });
});

describe("getContent", () => {
  it("uses mock content by default", async () => {
    const home = await getContent({}).getPage("home");
    expect(home?.hero.heading).toBeTruthy();
  });

  it("returns null for a missing slug", async () => {
    expect(await getContent({}).getEntry("clinicians", "nobody")).toBeNull();
  });

  it("needs CMS_API_URL when CONTENT_SOURCE=cms", () => {
    expect(() => getContent({ CONTENT_SOURCE: "cms" })).toThrow(/CMS_API_URL/);
  });
});
