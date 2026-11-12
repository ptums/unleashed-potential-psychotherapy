import { expect, test } from "@playwright/test";

// Every page below the first level shows Home / section / page, plus BreadcrumbList data.
const pages = [
  { path: "/reviews/share", trail: ["Home", "Reviews", "Share your experience"], parent: "/reviews" },
  { path: "/blog/grounding-skills-between-sessions", trail: ["Home", "Blog", "Grounding skills you can use between sessions"], parent: "/blog" },
  { path: "/specialties/emdr-therapy", trail: ["Home", "Specialties"], parent: "/#specialties" },
  { path: "/clinicians/jessica-rebelo", trail: ["Home", "Our Clinicians", "Jess Rebelo, LCSW"], parent: "/#clinicians" },
];

for (const { path, trail, parent } of pages) {
  test(`breadcrumbs on ${path}`, async ({ page }) => {
    await page.goto(path);
    const nav = page.getByRole("navigation", { name: "Breadcrumb" });
    const items = nav.getByRole("listitem");
    for (const [i, label] of trail.entries()) {
      await expect(items.nth(i)).toContainText(label);
    }
    await expect(nav.getByRole("link", { name: trail[1] })).toHaveAttribute("href", parent);
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    const data = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "{}");
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement[0]).toMatchObject({ position: 1, name: "Home" });
  });
}
