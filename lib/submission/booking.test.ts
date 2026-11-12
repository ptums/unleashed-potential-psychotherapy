import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// /api/submit with formType "booking". Content is the mock (Jess: Tue 9 to 5 ET, 24 h notice).
// fetch is faked by URL: Turnstile passes, the script returns the busy times and takes the request.
vi.mock("@/lib/content", async () => {
  const { mockRepository } = await import("@/lib/content/mock");
  return { getContent: () => mockRepository };
});
const { POST } = await import("@/app/api/submit/route");

let busy: { start: string; end: string }[] = [];
let sentToScript: Record<string, unknown> | null = null;

beforeEach(() => {
  vi.stubEnv("APPS_SCRIPT_URL", "https://script.google.com/macros/s/test/exec");
  vi.stubEnv("APPS_SCRIPT_TOKEN", "secret-token");
  vi.stubEnv("TURNSTILE_SECRET_KEY", "test");
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-02T17:00:00Z")); // Monday noon ET
  busy = [];
  sentToScript = null;
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>(async (input, init) => {
      const url = String(input);
      if (url.includes("turnstile")) {
        return Response.json({ success: true });
      }
      if (init?.method === "POST") {
        sentToScript = JSON.parse(String(init.body));
        return Response.json({ ok: true });
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

const request = (start: string) =>
  POST(
    new Request("https://uptherapygroup.com/api/submit", {
      method: "POST",
      body: JSON.stringify({
        formType: "booking",
        turnstileToken: "token",
        fields: {
          clinician: "jessica-rebelo",
          start,
          format: "video",
          name: "Kim C",
          email: "kim@example.com",
          phone: "555 010 0000",
          pay: "unsure",
          consent: true,
          website: "",
        },
      }),
    }),
  );

describe("booking requests", () => {
  it("sends an open time to the script with its end and a readable time", async () => {
    const res = await request("2026-11-03T17:00:00.000Z"); // Tue 12:00 ET
    expect(res.status).toBe(200);
    expect(sentToScript).toMatchObject({
      formType: "booking",
      fields: { start: "2026-11-03T17:00:00.000Z", end: "2026-11-03T17:15:00.000Z", when: "Tue, Nov 3 at 12:00 PM ET" },
    });
  });

  it("answers SLOT_TAKEN when the time is busy now, and sends nothing", async () => {
    busy = [{ start: "2026-11-03T17:00:00Z", end: "2026-11-03T17:15:00Z" }];
    const res = await request("2026-11-03T17:00:00.000Z");
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: "SLOT_TAKEN" });
    expect(sentToScript).toBeNull();
  });

  it("treats a time inside the notice as taken", async () => {
    const res = await request("2026-11-03T14:00:00.000Z"); // Tue 9:00 ET, under 24 h away
    expect(res.status).toBe(409);
  });

  it("needs the consent box", async () => {
    const res = await POST(
      new Request("https://uptherapygroup.com/api/submit", {
        method: "POST",
        body: JSON.stringify({
          formType: "booking",
          turnstileToken: "token",
          fields: { clinician: "jessica-rebelo", start: "2026-11-03T17:00:00.000Z", format: "video", name: "Kim", email: "kim@example.com", phone: "5550100000" },
        }),
      }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).invalid).toContain("consent");
  });
});
