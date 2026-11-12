import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const axe = (page: import("@playwright/test").Page) =>
  new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();

test("blog index: featured post, topic filter, axe", async ({ page }) => {
  await page.goto("/blog");
  await expect(page).toHaveTitle("Blog · Notes on Therapy and Healing");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Notes on therapy and healing");
  await expect(page.getByRole("heading", { level: 2, name: "Grounding skills you can use between sessions" })).toBeVisible();
  await expect(page.getByText("4 articles")).toBeVisible();

  await page.getByRole("button", { name: "Grief" }).click();
  await expect(page.getByRole("button", { name: "Grief" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("1 article in Grief")).toBeVisible();
  await page.getByRole("button", { name: "Starting therapy" }).click();
  await expect(page.getByText("No articles in this topic yet.")).toBeVisible();

  expect((await axe(page)).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test("blog post: article, crisis callout, related, axe", async ({ page }) => {
  await page.goto("/blog/grounding-skills-between-sessions");
  await expect(page).toHaveTitle("Grounding Skills You Can Use Between Sessions");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Grounding skills you can use between sessions");
  await expect(page.getByRole("heading", { level: 2, name: "2. Lengthen the exhale" })).toBeVisible();
  await expect(page.locator("blockquote")).toHaveText("The goal is not to feel calm. It is to feel here.");
  const crisis = page.getByRole("complementary", { name: "Crisis support" });
  await expect(crisis.getByRole("link", { name: "988" })).toHaveAttribute("href", "tel:988");
  await expect(page.getByRole("link", { name: "Jess Rebelo, LCSW" })).toHaveAttribute("href", "/clinicians/jessica-rebelo");
  await expect(page.locator("#related-heading ~ div article, section[aria-labelledby=related-heading] article")).toHaveCount(3);

  expect((await axe(page)).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test("an unknown post returns a real 404", async ({ page }) => {
  const res = await page.goto("/blog/no-such-post");
  expect(res?.status()).toBe(404);
});
