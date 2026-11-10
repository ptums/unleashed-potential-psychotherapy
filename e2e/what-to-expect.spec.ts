import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("what to expect renders every zone and passes axe", async ({ page }) => {
  await page.goto("/what-to-expect");
  await expect(page).toHaveTitle("What to Expect · Starting Therapy");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("What to expect");
  for (const name of ["Consultation", "Assessment", "The work", "Same care, in the room or on screen.", "Begin with a consultation."]) {
    await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
  }
  await expect(page.getByText("Step 3 of 3")).toBeVisible();
  await expect(page.locator("dt", { hasText: "Cost" })).toBeVisible();
  // Fees & Insurance has no page yet, so its link is hidden.
  await expect(page.getByRole("link", { name: "Fees & insurance" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Meet our clinicians" })).toHaveAttribute("href", "/#clinicians");

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
