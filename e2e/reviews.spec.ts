import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mockSubmit } from "./forms";

test("reviews lists every review, expands long ones and passes axe", async ({ page }) => {
  await page.goto("/reviews");
  await expect(page).toHaveTitle("Client Reviews · Unleashed Potential");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Client reviews");
  await expect(page.getByText("17 reviews from clients of our founder")).toBeVisible();
  await expect(page.locator("figure figcaption")).toHaveCount(17);
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

test("share form shows errors, then a thank-you toast", async ({ page }) => {
  // The ticket route, the Apps Script and AWS are mocked (e2e/forms.ts).
  const sent = await mockSubmit(page);
  await page.goto("/reviews/share");

  await page.getByRole("button", { name: "Send review" }).click();
  const summary = page.getByRole("alert").filter({ hasText: "Please fix 2 errors to continue." });
  await expect(summary).toBeFocused();
  await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Email")).toHaveAccessibleDescription("Error: enter an email address like name@example.com.");

  await page.getByLabel("Full name").fill("Kim C");
  await page.getByLabel("Email").fill("kim@example.com");
  await page.getByRole("radio", { name: "Excellent" }).check();
  await page.getByRole("button", { name: "Send review" }).click();

  // A toast thanks the visitor. The form stays and clears for the next person.
  await expect(page.getByRole("alert").filter({ hasText: "Thank you for sharing." })).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveValue("");
  await expect(page.getByRole("heading", { level: 1, name: "Share your experience" })).toBeVisible();
  // The ticket request holds no client details; the details go only to the Apps Script.
  expect(sent.ticket).toMatchObject({ formType: "review", website: "" });
  expect(JSON.stringify(sent.ticket)).not.toMatch(/Kim|kim@example/);
  expect(sent.script?.ticket).toBe("payload.signature");
  expect(sent.script?.fields).toMatchObject({ name: "Kim C", email: "kim@example.com", rating: "excellent" });

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("share form shows an error toast and keeps the input when sending fails", async ({ page }) => {
  await mockSubmit(page, { script: { json: { ok: false, error: "ticket expired" } } });
  await page.goto("/reviews/share");
  await page.getByLabel("Full name").fill("Kim C");
  await page.getByLabel("Email").fill("kim@example.com");
  await page.getByRole("button", { name: "Send review" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "We couldn't send your review." })).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveValue("Kim C");
});
