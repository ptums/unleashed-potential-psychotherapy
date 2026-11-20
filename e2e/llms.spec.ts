import { expect, test } from "@playwright/test";

test("llms.txt lists the practice and its main pages", async ({ request }) => {
  const res = await request.get("/llms.txt");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("text/markdown");
  const body = await res.text();
  expect(body).toMatch(/^# Unleashed Potential Psychotherapy\n\n> /);
  for (const heading of ["## Start here", "## Clinicians", "## Specialties", "## Blog"]) {
    expect(body).toContain(heading);
  }
  expect(body).toContain("/clinicians/jessica-rebelo");
  expect(body).toContain("/specialties/emdr-therapy");
});
