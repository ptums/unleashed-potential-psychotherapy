import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("reviews lists every review, expands long ones and passes axe", async ({ page }) => {
  await page.goto("/reviews");
  await expect(page).toHaveTitle("Client Reviews · Unleashed Potential");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Client reviews");
  await expect(page.getByText("18 reviews from clients of our founder")).toBeVisible();
  await expect(page.locator("figure figcaption")).toHaveCount(18);
  await expect(page.getByRole("link", { name: "Meet Jess" })).toHaveAttribute("href", "/clinicians/jessica-rebelo");

  // Kevin D's review is long: it starts clamped, and the button toggles it.
  const toggle = page.getByRole("button", { name: "Read full review" }).first();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(page.getByRole("button", { name: "Show less" }).first()).toHaveAttribute("aria-expanded", "true");

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("the Experience menu links to Reviews", async ({ page }) => {
  await page.goto("/");
  // The desktop dropdown and the mobile menu each have the link (both start closed).
  await expect(page.locator('header a[href="/reviews"]')).toHaveText(["Reviews", "Reviews"]);
});

test("the floating Share button opens the share page", async ({ page }) => {
  await page.goto("/reviews");
  const share = page.getByRole("link", { name: "Share your experience" });
  await expect(share).toHaveAttribute("href", "/reviews/share");
  await expect(share).toHaveCSS("position", "fixed");
});

test("share page renders the form and passes axe", async ({ page }) => {
  await page.goto("/reviews/share");
  await expect(page).toHaveTitle("Share Your Experience · Unleashed Potential");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Share your experience");
  await expect(page.getByLabel("Full name")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Excellent" })).toBeVisible();
  await expect(page.getByRole("complementary").getByRole("link", { name: "988" })).toHaveAttribute("href", "tel:988");

  // The form sends nothing yet: the button stays on the page.
  await page.getByRole("button", { name: "Send feedback" }).click();
  await expect(page).toHaveURL(/\/reviews\/share$/);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
