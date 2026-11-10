import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("our approach renders every zone and passes axe", async ({ page }) => {
  await page.goto("/our-approach");
  await expect(page).toHaveTitle("Our Approach · Unleashed Potential");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Our approach");
  for (const name of ["What guides our work", "What every client can count on", "A note from our founder", "Ready to talk with a clinician?"]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  await expect(page.locator("dt")).toHaveCount(4);
  await expect(page.getByRole("link", { name: "Read Jess’s profile" })).toHaveAttribute("href", "/clinicians/jess-rebelo");
  await expect(page.getByRole("link", { name: "Book a Consultation" })).toHaveAttribute("href", "/clinicians/jess-rebelo");

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
