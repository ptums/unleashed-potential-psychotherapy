import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("specialty page renders every zone and passes axe", async ({ page }) => {
  await page.goto("/specialties/emdr");
  await expect(page).toHaveTitle("EMDR Therapy · Long Island & Online, NY");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("EMDR therapy");
  for (const name of ["EMDR may help if you live with", "What EMDR looks like", "Clinicians who offer EMDR", "About EMDR", "Talk with an EMDR clinician."]) {
    await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "See EMDR clinicians" })).toHaveAttribute("href", "#clinicians");
  await expect(page.locator("#clinicians article")).toHaveCount(1);

  const faq = page.getByText("How many sessions will I need?");
  await faq.click();
  await expect(page.getByText("It depends on your history and goals.")).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("an unknown specialty returns a real 404", async ({ page }) => {
  const res = await page.goto("/specialties/anxiety");
  expect(res?.status()).toBe(404);
});
