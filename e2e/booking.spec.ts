import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// /api/availability is mocked: the Apps Script is never called from tests.
const slots = [
  { start: "2030-01-08T14:00:00.000Z", end: "2030-01-08T14:15:00.000Z" }, // Tue Jan 8, 9:00 AM ET
  { start: "2030-01-08T14:15:00.000Z", end: "2030-01-08T14:30:00.000Z" },
  { start: "2030-01-09T17:00:00.000Z", end: "2030-01-09T17:15:00.000Z" }, // Wed Jan 9, 12:00 PM ET
];

test("book step 1: pick a time and a format, then continue", async ({ page }) => {
  await page.route("**/api/availability**", (route) =>
    route.fulfill({ json: { ok: true, timezone: "America/New_York", slots } }),
  );
  await page.goto("/book?clinician=jessica-rebelo");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Choose a time");
  await expect(page.getByText("Step 1 of 3")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Book a consultation");

  // No time chosen: a text error, and the step does not change.
  await page.getByRole("button", { name: "Continue to your details" }).click();
  await expect(page.getByText("Error: choose a time.")).toBeVisible();

  await expect(page.getByText("Tue, Jan 8")).toBeVisible();
  await page.getByRole("radio", { name: "9:15 AM" }).check();
  await page.getByRole("radio", { name: "Phone call" }).check();
  const summary = page.getByRole("complementary");
  await expect(summary).toContainText("Tue, Jan 8 at 9:15 AM ET");
  await expect(summary).toContainText("Phone call");

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);

  await page.getByRole("button", { name: "Continue to your details" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Your details" })).toBeFocused();
  await expect(page.getByText("Step 2 of 3")).toBeVisible();
});

test("book shows a message when the calendar can't be read", async ({ page }) => {
  await page.route("**/api/availability**", (route) => route.fulfill({ status: 503, json: { ok: false } }));
  await page.goto("/book?clinician=jessica-rebelo");
  await expect(page.getByRole("alert").filter({ hasText: "couldn’t load open times" })).toBeVisible();
});

test("book without a known clinician goes to the clinician list", async ({ page }) => {
  await page.goto("/book");
  await expect(page).toHaveURL(/\/#clinicians$/);
});
