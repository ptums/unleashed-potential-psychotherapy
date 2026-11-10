import { expect, test } from "@playwright/test";

test("home renders every zone from content", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Trauma-Informed Psychotherapy · Long Island, NY");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Evidence-based therapy/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/A space to heal/);
  for (const name of ["Featured in", "What we treat", "Choose your clinician, then your time.", "Three steps to begin", "Our approach"]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  await expect(page.locator("#specialties li")).toHaveCount(6);
  await expect(page.locator('#specialties a[href="/specialties/emdr"]')).toContainText("EMDR therapy");
  await expect(page.getByRole("link", { name: /View profile & times/ })).toHaveAttribute("href", "/clinicians/jess-rebelo");
});

test("links to pages that do not exist yet are hidden", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Careers" })).toHaveCount(0);
});
