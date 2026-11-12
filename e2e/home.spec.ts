import { expect, test } from "@playwright/test";

test("home renders every zone from content", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Trauma-Informed Psychotherapy · Long Island, NY");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Evidence-based therapy/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/A space to heal/);
  for (const name of ["Featured in", "What we treat", "Choose your clinician, then your time.", "Three steps to begin", "Client reviews"]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  await expect(page.locator("#specialties li")).toHaveCount(6);
  await expect(page.locator('#specialties a[href="/specialties/emdr-therapy"]')).toContainText("EMDR therapy");
  await expect(page.getByRole("link", { name: /View profile & times/ })).toHaveAttribute("href", "/clinicians/jessica-rebelo");
});

test("links to pages that do not exist yet are hidden", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Careers" })).toHaveCount(0);
});

test("home review carousel steps through the reviews", async ({ page }) => {
  await page.goto("/");
  const band = page.locator("section", { has: page.getByRole("heading", { name: "Client reviews", exact: true }) });
  await expect(band.getByText("Kevin D", { exact: true })).toBeVisible();
  await expect(band.getByText("1 / 18")).toBeVisible();
  await band.getByRole("button", { name: "Next review" }).click();
  await expect(band.getByText("Sky G", { exact: true })).toBeVisible();
  await expect(band.getByText("Kevin D", { exact: true })).toBeHidden();
  await band.getByRole("button", { name: "Previous review" }).click();
  await band.getByRole("button", { name: "Previous review" }).click();
  await expect(band.getByText("18 / 18")).toBeVisible();
  await expect(band.getByRole("link", { name: "Read all reviews" })).toHaveAttribute("href", "/reviews");
});
