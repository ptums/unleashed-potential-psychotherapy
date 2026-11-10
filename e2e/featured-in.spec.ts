import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("featured in renders every zone and passes axe", async ({ page }) => {
  await page.goto("/featured-in");
  await expect(page).toHaveTitle("Podcasts & Press · Jess Rebelo, LCSW");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Podcasts & press");
  for (const name of ["Self-worth is key in relationship dynamics", "Episodes & interviews", "Press & speaking"]) {
    await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
  }
  await expect(page.locator("article")).toHaveCount(4);
  await expect(page.getByText("Part 4 · April 1, 2024")).toBeVisible();
  await expect(page.getByRole("link", { name: "Meet our founder" })).toHaveAttribute("href", "/clinicians/jess-rebelo");

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
