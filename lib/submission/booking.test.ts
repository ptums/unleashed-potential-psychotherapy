import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyTicket } from "./ticket";

// /api/ticket (UPTG-38). Content is the mock (Jess: Tue 9 to 5 ET, 24 h notice).
// fetch is faked by URL: Turnstile passes, and the script's availability GET returns the busy times.
vi.mock("@/lib/content", async () => {
  const { mockRepository } = await import("@/lib/content/mock");
  return { getContent: () => mockRepository };
});
const { POST } = await import("@/app/api/ticket/route");

let busy: { start: string; end: string }[] = [];
let calls: string[] = [];

beforeEach(() => {
  vi.stubEnv("APPS_SCRIPT_URL", "https://script.google.com/macros/s/test/exec");
  vi.stubEnv("APPS_SCRIPT_TOKEN", "secret-token");
  vi.stubEnv("TURNSTILE_SECRET_KEY", "test");
  vi.stubEnv("TICKET_SECRET", "ticket-secret");
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-02T17:00:00Z")); // Monday noon ET
  busy = [];
  calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>(async (input, init) => {
      const url = String(input);
      calls.push(`${init?.method ?? "GET"} ${url.split("?")[0]}`);
      if (url.includes("turnstile")) {
        return Response.json({ success: true });
      }
      return Response.json({ ok: true, busy });
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const post = (body: object) =>
  POST(new Request("https://uptherapygroup.com/api/ticket", { method: "POST", body: JSON.stringify(body) }));

const booking = (start: string, extra: object = {}) =>
  post({ formType: "booking", turnstileToken: "token", website: "", isTest: false, slot: { clinician: "jessica-rebelo", start }, ...extra });

describe("booking tickets", () => {
  it("signs a ticket for an open time, with its end and a readable time", async () => {
    const res = await booking("2026-11-03T17:00:00.000Z"); // Tue 12:00 ET
    expect(res.status).toBe(200);
    const body = await res.json();
    const payload = await verifyTicket(body.ticket, "ticket-secret");
    expect(payload).toMatchObject({
      id: body.id,
      formType: "booking",
      isTest: false,
      slot: { clinician: "jessica-rebelo", start: "2026-11-03T17:00:00.000Z", end: "2026-11-03T17:15:00.000Z", when: "Tue, Nov 3 at 12:00 PM ET" },
    });
  });

  it("never sends anything to the script's form endpoint (no POST leaves the Worker)", async () => {
    await booking("2026-11-03T17:00:00.000Z", { fields: { name: "Kim C", email: "kim@example.com" } });
    expect(calls.filter((c) => c.startsWith("POST") && !c.includes("turnstile"))).toEqual([]);
  });

  it("answers SLOT_TAKEN when the time is busy now", async () => {
    busy = [{ start: "2026-11-03T17:00:00Z", end: "2026-11-03T17:15:00Z" }];
    const res = await booking("2026-11-03T17:00:00.000Z");
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: "SLOT_TAKEN" });
  });

  it("treats a time inside the notice as taken", async () => {
    const res = await booking("2026-11-03T14:00:00.000Z"); // Tue 9:00 ET, under 24 h away
    expect(res.status).toBe(409);
  });

  it("needs a clinician and a start time", async () => {
    const res = await post({ formType: "booking", turnstileToken: "token", slot: {} });
    expect(res.status).toBe(400);
    expect((await res.json()).invalid.sort()).toEqual(["clinician", "start"]);
  });
});

describe("tickets for every form", () => {
  it("gives a review ticket with no slot", async () => {
    const res = await post({ formType: "review", turnstileToken: "token", website: "", isTest: true });
    const body = await res.json();
    const payload = await verifyTicket(body.ticket, "ticket-secret");
    expect(payload).toMatchObject({ formType: "review", isTest: true });
    expect(payload?.slot).toBeUndefined();
  });

  it("answers a filled honeypot with ok and no ticket", async () => {
    const res = await post({ formType: "review", turnstileToken: "token", website: "http://spam.example" });
    expect(await res.json()).toMatchObject({ ok: true, ticket: null });
  });

  it("refuses an unknown form, and says so when the secret is not set", async () => {
    expect((await post({ formType: "contact" })).status).toBe(400);
    vi.stubEnv("TICKET_SECRET", "");
    expect((await post({ formType: "review", turnstileToken: "token" })).status).toBe(503);
  });
});
