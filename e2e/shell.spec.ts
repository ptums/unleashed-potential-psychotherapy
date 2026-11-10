import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home has the shell and no axe violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Book an appointment" }).first()).toBeVisible();
  await expect(page.getByText("In crisis or in danger?")).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("no horizontal scroll", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("an unknown path returns a real 404", async ({ page }) => {
  const res = await page.goto("/no-such-page");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("We could not find that page.");
});

test("mobile menu opens and closes with Escape", async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) >= 900, "mobile only");
  await page.goto("/");
  const menu = page.getByLabel("Open menu");
  await menu.click();
  await expect(page.getByRole("navigation", { name: "Main mobile" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Main mobile" })).toBeHidden();
});
