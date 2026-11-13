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
  await expect(page.getByText("Step 1 of 2")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Book a consultation");

  // No time chosen: a text error, and the step does not change.
  await page.getByRole("button", { name: "Continue to your details" }).click();
  await expect(page.getByText("Error: choose a time.")).toBeVisible();

  // A month calendar: the first open day is chosen, and its times show beside it.
  await expect(page.getByText("January 2030")).toBeVisible();
  await expect(page.getByRole("button", { name: /Tuesday, January 8, 2 open times/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("group", { name: "Morning" }).getByRole("radio", { name: "9:15 AM" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Afternoon" })).toHaveCount(0); // Jan 8 has morning times only
  await page.getByRole("button", { name: /Wednesday, January 9/ }).click();
  await expect(page.getByRole("group", { name: "Afternoon" }).getByRole("radio", { name: "12:00 PM" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "9:15 AM" })).toHaveCount(0);
  await page.getByRole("button", { name: /Tuesday, January 8/ }).click();
  await page.getByRole("radio", { name: "9:15 AM" }).check();
  await page.getByRole("radio", { name: "Phone call" }).check();
  const summary = page.getByRole("complementary");
  await expect(summary).toContainText("Tue, Jan 8 at 9:15 AM ET");
  await expect(summary).toContainText("Phone call");

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);

  await page.getByRole("button", { name: "Continue to your details" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Your details" })).toBeFocused();
  await expect(page.getByText("Step 2 of 2")).toBeVisible();
});

async function toDetails(page: import("@playwright/test").Page) {
  await page.route("**/api/availability**", (route) =>
    route.fulfill({ json: { ok: true, timezone: "America/New_York", slots } }),
  );
  await page.goto("/book?clinician=jessica-rebelo");
  await page.getByRole("radio", { name: "9:15 AM" }).check();
  await page.getByRole("button", { name: "Continue to your details" }).click();
}

test("book step 2: errors, then a toast and a fresh start", async ({ page }) => {
  let sent: { formType?: string; fields?: Record<string, unknown> } = {};
  await page.route("**/api/submit", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ json: { ok: true, id: "test-id" } });
  });
  await toDetails(page);

  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Please fix 4 errors to continue." })).toBeFocused();
  await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel("Full name").fill("Kim C");
  await page.getByLabel("Email").fill("kim@example.com");
  await page.getByLabel("Phone").fill("555 010 0000");
  await page.getByRole("radio", { name: "Not sure yet" }).check();
  await page.getByRole("checkbox").check();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
  await page.getByRole("button", { name: "Send request" }).click();

  // As on the review form: a toast, then the flow starts over with nothing chosen.
  await expect(page.getByRole("alert").filter({ hasText: "Request sent." })).toContainText("Tue, Jan 8 at 9:15 AM ET, by video call");
  await expect(page.getByRole("heading", { level: 1, name: "Choose a time" })).toBeFocused();
  await expect(page.getByRole("radio", { name: "9:15 AM" })).not.toBeChecked();
  expect(sent.formType).toBe("booking");
  expect(sent.fields).toMatchObject({ clinician: "jessica-rebelo", start: slots[1].start, format: "video", consent: true });
});

test("book: a time taken meanwhile goes back to step 1 with fresh times", async ({ page }) => {
  await page.route("**/api/submit", (route) => route.fulfill({ status: 409, json: { ok: false, code: "SLOT_TAKEN" } }));
  await toDetails(page);
  await page.getByLabel("Full name").fill("Kim C");
  await page.getByLabel("Email").fill("kim@example.com");
  await page.getByLabel("Phone").fill("555 010 0000");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Choose a time" })).toBeFocused();
  await expect(page.getByText("That time was just booked. Please choose another.")).toBeVisible();
  await expect(page.getByRole("radio", { name: "9:15 AM" })).not.toBeChecked();
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

test("book: the send button shows a spinner while it works", async ({ page }) => {
  let release: () => void = () => {};
  await page.route("**/api/submit", async (route) => {
    await new Promise<void>((resolve) => (release = resolve));
    await route.fulfill({ json: { ok: true, id: "test-id" } });
  });
  await toDetails(page);
  await page.getByLabel("Full name").fill("Kim C");
  await page.getByLabel("Email").fill("kim@example.com");
  await page.getByLabel("Phone").fill("555 010 0000");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send request" }).click();
  const busy = page.getByRole("button", { name: "Sending…" });
  await expect(busy).toHaveAttribute("aria-busy", "true");
  await expect(busy).toBeDisabled();
  await expect(busy.locator("svg")).toBeVisible();
  release();
  await expect(page.getByRole("alert").filter({ hasText: "Request sent." })).toBeVisible();
});

test("book: a failed send shows an error toast and keeps the details", async ({ page }) => {
  await page.route("**/api/submit", (route) => route.fulfill({ status: 502, json: { ok: false } }));
  await toDetails(page);
  await page.getByLabel("Full name").fill("Kim C");
  await page.getByLabel("Email").fill("kim@example.com");
  await page.getByLabel("Phone").fill("555 010 0000");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "We couldn’t send your request." })).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveValue("Kim C");
});

test("the header calendar icon opens booking with Jess", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Book an appointment" }).first()).toHaveAttribute(
    "href",
    "/book?clinician=jessica-rebelo",
  );
});
