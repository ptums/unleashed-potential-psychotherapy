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

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("share form shows errors, then the thank-you state", async ({ page }) => {
  // /api/submit is mocked: the Apps Script and AWS are not called from tests.
  let sent: { formType?: string; fields?: Record<string, unknown> } = {};
  await page.route("**/api/submit", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ json: { ok: true, id: "test-id" } });
  });
  await page.goto("/reviews/share");

  await page.getByRole("button", { name: "Send feedback" }).click();
  const summary = page.getByRole("alert").filter({ hasText: "Please fix 2 errors to continue." });
  await expect(summary).toBeFocused();
  await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Email")).toHaveAccessibleDescription("Error: enter an email address like name@example.com.");

  await page.getByLabel("Full name").fill("Kim C");
  await page.getByLabel("Email").fill("kim@example.com");
  await page.getByRole("radio", { name: "Excellent" }).check();
  await page.getByRole("button", { name: "Send feedback" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Thank you for sharing." })).toBeFocused();
  expect(sent.formType).toBe("feedback");
  expect(sent.fields).toMatchObject({ name: "Kim C", email: "kim@example.com", rating: "excellent", website: "" });

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});
