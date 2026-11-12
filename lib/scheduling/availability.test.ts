import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchBusy } from "./busy";

// The route reads content (the mock: Jess has Tue/Wed/Thu/Fri hours) and busy times from the script.
vi.mock("@/lib/content", async () => {
  const { mockRepository } = await import("@/lib/content/mock");
  return { getContent: () => mockRepository };
});

const { GET } = await import("@/app/api/availability/route");

function fakeScript(body: unknown, status = 200) {
  const fetchMock = vi.fn<typeof fetch>(async () => Response.json(body, { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.stubEnv("APPS_SCRIPT_URL", "https://script.google.com/macros/s/test/exec");
  vi.stubEnv("APPS_SCRIPT_TOKEN", "secret-token");
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-02T17:00:00Z")); // Monday noon ET
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("fetchBusy", () => {
  it("asks the script for the range with the token, and reads start/end only", async () => {
    const fetchMock = fakeScript({ ok: true, busy: [{ start: "2026-11-04T17:00:00Z", end: "2026-11-04T18:00:00Z" }] });
    const busy = await fetchBusy(new Date("2026-11-02T00:00:00Z"), new Date("2026-11-03T00:00:00Z"));
    expect(busy).toEqual([{ start: new Date("2026-11-04T17:00:00Z"), end: new Date("2026-11-04T18:00:00Z") }]);
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get("token")).toBe("secret-token");
    expect(url.searchParams.get("from")).toBe("2026-11-02T00:00:00.000Z");
  });

  it("gives null when the script refuses or is not set up", async () => {
    fakeScript({ ok: false, error: "bad token" });
    expect(await fetchBusy(new Date(), new Date())).toBeNull();
    vi.stubEnv("APPS_SCRIPT_URL", "");
    expect(await fetchBusy(new Date(), new Date())).toBeNull();
  });
});

describe("GET /api/availability", () => {
  const get = (slug: string) => GET(new Request(`https://uptherapygroup.com/api/availability?clinician=${slug}`));

  it("returns open times: weekly hours after the notice, minus busy times and buffer", async () => {
    // Busy Wednesday 12:00 to 13:00 ET. With the 15-minute buffer, the first Wednesday time is 13:15.
    fakeScript({ ok: true, busy: [{ start: "2026-11-04T17:00:00Z", end: "2026-11-04T18:00:00Z" }] });
    const res = await get("jessica-rebelo");
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.timezone).toBe("America/New_York");
    // Tuesday 9:00 ET is inside the 24-hour notice from Monday noon, so the first time is Tuesday 12:00.
    expect(data.slots[0].start).toBe("2026-11-03T17:00:00.000Z");
    const wednesday = data.slots.find((s: { start: string }) => s.start.startsWith("2026-11-04"));
    expect(wednesday.start).toBe("2026-11-04T18:15:00.000Z");
  });

  it("shows no times when the calendar can't be read", async () => {
    fakeScript({ ok: false, error: "bad token" });
    const res = await get("jessica-rebelo");
    expect(res.status).toBe(503);
  });

  it("404s an unknown clinician without calling the script", async () => {
    const fetchMock = fakeScript({ ok: true, busy: [] });
    expect((await get("nobody")).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
