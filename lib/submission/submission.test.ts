import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reviewSchema, isFormType } from "../forms/schemas";
import { sendToAppsScript } from "./apps-script";
import { markDelivered, putSubmission, toItem } from "./store";

const record = {
  id: "abc",
  formType: "review" as const,
  createdAt: "2026-11-12T12:00:00.000Z",
  spamResult: "passed" as const,
  isTest: true,
};

// A fake fetch: capture each request and answer with the status and body we choose.
function fakeFetch(status: number, body: unknown = {}) {
  const fetchMock = vi.fn<typeof fetch>(async () => Response.json(body, { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.stubEnv("AWS_REGION", "us-east-2");
  vi.stubEnv("AWS_ACCESS_KEY_ID", "test-key");
  vi.stubEnv("AWS_SECRET_ACCESS_KEY", "test-secret");
  vi.stubEnv("SUBMISSIONS_TABLE", "form-submissions");
  vi.stubEnv("APPS_SCRIPT_URL", "https://script.google.com/macros/s/test/exec");
  vi.stubEnv("APPS_SCRIPT_TOKEN", "secret-token");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("review schema", () => {
  it("needs a name and a valid email", async () => {
    const err = await reviewSchema.validate({ name: "", email: "nope" }, { abortEarly: false }).catch((e) => e);
    expect(err.inner.map((e: { path: string }) => e.path).sort()).toEqual(["email", "name"]);
  });

  it("accepts the minimum and fills the defaults", async () => {
    const value = await reviewSchema.validate({ name: " Kim C ", email: "kim@example.com" });
    expect(value).toMatchObject({ name: "Kim C", phone: "", rating: "", publishConsent: false });
  });

  it("knows the review and booking forms", () => {
    expect(isFormType("review")).toBe(true);
    expect(isFormType("feedback")).toBe(false);
    expect(isFormType("booking")).toBe(true);
  });
});

describe("debug log record", () => {
  it("holds metadata only, with a 12-month TTL", () => {
    const item = toItem(record);
    expect(Object.keys(item).sort()).toEqual(["createdAt", "expiresAt", "formType", "isTest", "pk", "spamResult"]);
    expect(item.pk.S).toBe("sub#abc");
    const ttl = Number(item.expiresAt.N) - Date.parse(record.createdAt) / 1000;
    expect(ttl).toBe(365 * 24 * 60 * 60);
  });

  it("writes the record once and fails loudly on an AWS error", async () => {
    const fetchMock = fakeFetch(200);
    await putSubmission(record);
    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.headers.get("X-Amz-Target")).toBe("DynamoDB_20120810.PutItem");
    expect(await request.json()).toMatchObject({ TableName: "form-submissions", ConditionExpression: "attribute_not_exists(pk)" });

    fakeFetch(400);
    await expect(markDelivered("abc", "sent")).rejects.toThrow("DynamoDB UpdateItem 400");
  });
});

describe("debug log not set up yet", () => {
  it("skips the write without calling AWS", async () => {
    const fetchMock = fakeFetch(500);
    vi.stubEnv("SUBMISSIONS_TABLE", "");
    await expect(putSubmission(record)).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("Apps Script handoff", () => {
  const payload = { formType: "review" as const, id: "abc", createdAt: record.createdAt, isTest: false, fields: {} as never };

  it("sends the shared token with the submission", async () => {
    const fetchMock = fakeFetch(200, { ok: true });
    expect(await sendToAppsScript(payload)).toEqual({ ok: true });
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(init.body as string)).toMatchObject({ token: "secret-token", id: "abc", formType: "review" });
  });

  it("follows the web app redirect with a GET, not a second POST", async () => {
    const echo = "https://script.googleusercontent.com/macros/echo?user_content_key=x";
    const fetchMock = vi.fn<typeof fetch>(async (_input, init) =>
      init?.method === "POST"
        ? new Response(null, { status: 302, headers: { location: echo } })
        : Response.json({ ok: true }),
    );
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendToAppsScript(payload)).toEqual({ ok: true });
    expect(fetchMock.mock.calls[1]).toEqual([echo, { method: "GET" }]);
  });

  it("fails when the script says no, or when it is not set up", async () => {
    fakeFetch(200, { ok: false, error: "bad token" });
    expect(await sendToAppsScript(payload)).toEqual({ ok: false });

    vi.stubEnv("APPS_SCRIPT_URL", "");
    expect(await sendToAppsScript(payload)).toEqual({ ok: false });
  });
});
