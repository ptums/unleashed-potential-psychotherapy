import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reviewSchema, isFormType } from "../forms/schemas";
import { signTicket, verifyTicket } from "./ticket";
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

describe("submission tickets", () => {
  const payload = {
    v: 1 as const,
    id: "abc",
    formType: "booking" as const,
    createdAt: record.createdAt,
    exp: Date.parse("2026-11-12T12:10:00.000Z"),
    isTest: false,
    slot: { clinician: "jessica-rebelo", start: "2026-11-17T15:00:00.000Z", end: "2026-11-17T15:15:00.000Z", when: "Tue, Nov 17 at 10:00 AM ET", clinicianName: "Jessica Rebelo, LCSW" },
  };
  const now = Date.parse("2026-11-12T12:00:00.000Z");

  it("signs a ticket the same check accepts, and carries no client details", async () => {
    const ticket = await signTicket(payload, "secret");
    expect(ticket).toMatch(/^[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+$/);
    expect(await verifyTicket(ticket, "secret", now)).toEqual(payload);
    expect(Object.keys(payload).sort()).toEqual(["createdAt", "exp", "formType", "id", "isTest", "slot", "v"]);
  });

  it("matches the Apps Script format: web-safe base64 with padding, HMAC-SHA256 over the payload text", async () => {
    const ticket = await signTicket(payload, "secret");
    const [body, signature] = ticket.split(".");
    const { createHmac } = await import("node:crypto");
    const expected = createHmac("sha256", "secret").update(body).digest("base64").replace(/\+/g, "-").replace(/\//g, "_");
    expect(signature).toBe(expected);
    expect(JSON.parse(Buffer.from(body, "base64url").toString("utf8"))).toEqual(payload);
  });

  it("refuses a wrong secret, a changed payload, or an expired ticket", async () => {
    const ticket = await signTicket(payload, "secret");
    expect(await verifyTicket(ticket, "other-secret", now)).toBeNull();
    const [body, signature] = ticket.split(".");
    const forged = Buffer.from(JSON.stringify({ ...payload, isTest: true })).toString("base64url");
    expect(await verifyTicket(`${forged}.${signature}`, "secret", now)).toBeNull();
    expect(await verifyTicket(`${body}.${signature}`, "secret", payload.exp + 1)).toBeNull();
  });
});
