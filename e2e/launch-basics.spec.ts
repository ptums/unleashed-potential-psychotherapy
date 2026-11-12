import { expect, test } from "@playwright/test";

test("robots.txt allows crawling and points at the sitemap", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain("Allow: /");
  expect(body).toContain("Sitemap: https://uptherapygroup.com/sitemap.xml");
});

test("sitemap lists every built page", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const body = await res.text();
  for (const path of ["/our-approach", "/what-to-expect", "/featured-in", "/blog", "/specialties/emdr-therapy", "/clinicians/jessica-rebelo", "/blog/grounding-skills-between-sessions"]) {
    expect(body).toContain(`<loc>https://uptherapygroup.com${path}</loc>`);
  }
  expect(body).not.toContain("/book");
});

test("the site icon is served", async ({ page, request }) => {
  await page.goto("/");
  const href = await page.locator('link[rel="icon"]').first().getAttribute("href");
  expect(href).toBeTruthy();
  const res = await request.get(href!);
  expect(res.status()).toBe(200);
});
