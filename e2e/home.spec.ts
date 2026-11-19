import { expect, test } from "@playwright/test";

test("home renders every zone from content", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Trauma-Informed Psychotherapy · Long Island, NY");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Evidence-based therapy/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/A space to heal/);
  for (const name of ["Featured in", "What we treat", "Choose your clinician, then your time.", "Three steps to begin", "In their own words"]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  await expect(page.locator("#specialties li")).toHaveCount(6);
  await expect(page.locator('#specialties a[href="/specialties/emdr-therapy"]')).toContainText("EMDR therapy");
  await expect(page.getByRole("link", { name: /View profile & times/ })).toHaveAttribute("href", "/clinicians/jessica-rebelo");
});

test("links to pages that do not exist yet are hidden", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Careers" })).toHaveCount(0);
});

test("home review carousel shows snippets and scrolls by card", async ({ page }) => {
  // Playwright runs with reduced motion, so the row does not move on its own here.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const band = page.locator("section", { has: page.getByRole("heading", { name: "In their own words", exact: true }) });
  const row = band.getByRole("list", { name: "Client reviews" });
  await expect(row.getByRole("listitem")).toHaveCount(17);
  // Each snippet is cut to 220 characters.
  const first = await row.locator("blockquote p").first().textContent();
  expect(first?.length).toBeLessThanOrEqual(220);
  expect(first).toMatch(/\.\.\.$/);
  await expect(band.getByRole("link", { name: "Read all reviews", exact: true })).toHaveAttribute("href", "/reviews");
  const before = await row.evaluate((el) => el.scrollLeft);
  await band.getByRole("button", { name: "Next reviews" }).click();
  await expect.poll(() => row.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
  // No Google row until the CMS has a profile link and blurbs.
  await expect(band.getByText("Google reviews")).toHaveCount(0);
  // The row scrolls inside itself; the page never scrolls sideways.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
