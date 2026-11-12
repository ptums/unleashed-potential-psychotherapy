import type { Interval } from "./slots";

// Jess's busy times, from the Apps Script doGet (TWS-109). The script reads her shared
// calendar and returns only start and end times: never titles, guests or notes.
//   GET {APPS_SCRIPT_URL}?token=…&from=ISO&to=ISO  →  { ok: true, busy: [{ start, end }] }

export async function fetchBusy(from: Date, to: Date): Promise<Interval[] | null> {
  const url = process.env.APPS_SCRIPT_URL;
  const token = process.env.APPS_SCRIPT_TOKEN;
  if (!url || !token) {
    console.error("fetchBusy: APPS_SCRIPT_URL or APPS_SCRIPT_TOKEN is not set");
    return null;
  }
  const query = new URLSearchParams({ token, from: from.toISOString(), to: to.toISOString() });
  try {
    // A GET to a web app redirects to its output with GET too, so the default follow works.
    const res = await fetch(`${url}?${query}`, { redirect: "follow" });
    const data = (await res.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
      busy?: { start: string; end: string }[];
    } | null;
    if (!res.ok || !data?.ok || !Array.isArray(data.busy)) {
      const reason = data?.error ?? `not JSON (${res.headers.get("content-type") ?? "no content type"})`;
      console.error("fetchBusy failed", res.status, reason);
      return null;
    }
    return data.busy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
  } catch (err) {
    console.error("fetchBusy failed", err);
    return null;
  }
}
