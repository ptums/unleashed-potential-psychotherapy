import type { Page } from "@playwright/test";

// Form submissions in e2e (UPTG-38): the ticket route, the Apps Script web app and the delivered
// route are all mocked. CI builds with NEXT_PUBLIC_APPS_SCRIPT_URL set to this fake address.
export const SCRIPT_URL = "https://script.example.test/exec";

type Reply = { status?: number; json: unknown };

export interface Sent {
  /** The body sent to /api/ticket. It must never hold client details. */
  ticket?: Record<string, unknown>;
  /** The body sent to the Apps Script: the ticket and the fields. */
  script?: { ticket?: string; fields?: Record<string, unknown> };
}

export async function mockSubmit(
  page: Page,
  options: { ticket?: Reply; script?: Reply; holdScript?: Promise<void> } = {},
): Promise<Sent> {
  const sent: Sent = {};
  await page.route("**/api/ticket", async (route) => {
    sent.ticket = route.request().postDataJSON();
    await route.fulfill(options.ticket ?? { json: { ok: true, id: "00000000-0000-4000-8000-000000000000", ticket: "payload.signature" } });
  });
  await page.route(SCRIPT_URL, async (route) => {
    sent.script = JSON.parse(route.request().postData() ?? "{}");
    await options.holdScript;
    await route.fulfill({ status: options.script?.status ?? 200, json: options.script?.json ?? { ok: true }, headers: { "access-control-allow-origin": "*" } });
  });
  await page.route("**/api/delivered", (route) => route.fulfill({ json: { ok: true } }));
  return sent;
}
