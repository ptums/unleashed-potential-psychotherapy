import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("clinician profile renders every zone and passes axe", async ({ page }) => {
  await page.goto("/clinicians/jessica-rebelo");
  await expect(page).toHaveTitle("Jess Rebelo, LCSW · Trauma & EMDR Therapist");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Jess Rebelo, LCSW");
  for (const name of ["Book with Jess", "Approach", "Credentials", "Fees & insurance", "Featured in"]) {
    await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  await expect(page.getByRole("link", { name: "EMDR therapy" })).toHaveAttribute("href", "/specialties/emdr");
  await expect(page.getByRole("row", { name: /Consultation · 15 min/ })).toContainText("Free");
  // Booking is left empty until the Google Calendar phase.
  await expect(page.locator("#book a")).toHaveCount(0);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("an unknown clinician returns a real 404", async ({ page }) => {
  const res = await page.goto("/clinicians/nobody");
  expect(res?.status()).toBe(404);
});
