import type { FormType, FormValues } from "../forms/schemas";

// Replaces SendGrid from jessrebelo.com (TWS-108). The route sends each checked submission to
// 1 Apps Script web app with a shared secret. The script rejects a wrong token, adds a row to
// the Sheet (with a timestamp) and emails Jess.

export interface AppsScriptPayload<T extends FormType = FormType> {
  token: string;
  formType: T;
  id: string;
  createdAt: string;
  isTest: boolean;
  fields: FormValues[T];
}

/**
 * An Apps Script web app runs doPost, then answers with a 302 to a googleusercontent.com URL
 * that serves the result. That URL accepts GET only: a client that re-sends the POST there
 * (as the Worker's fetch did) gets a Drive error page. So the redirect is followed by hand, with GET.
 */
async function postToWebApp(url: string, body: string): Promise<Response> {
  const first = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    redirect: "manual",
  });
  const location = first.headers.get("location");
  if (first.status >= 300 && first.status < 400 && location) {
    return fetch(location, { method: "GET" });
  }
  return first;
}

export async function sendToAppsScript(payload: Omit<AppsScriptPayload, "token">): Promise<{ ok: boolean }> {
  const url = process.env.APPS_SCRIPT_URL;
  const token = process.env.APPS_SCRIPT_TOKEN;
  if (!url || !token) {
    console.error("sendToAppsScript: APPS_SCRIPT_URL or APPS_SCRIPT_TOKEN is not set", payload.id);
    return { ok: false };
  }
  try {
    const res = await postToWebApp(url, JSON.stringify({ ...payload, token }));
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!res.ok || !data?.ok) {
      // The script's own error text ("bad token", "unknown form") or the content type when the
      // answer is not JSON. Never the form fields.
      const reason = data?.error ?? `not JSON (${res.headers.get("content-type") ?? "no content type"})`;
      console.error("sendToAppsScript failed", payload.id, res.status, reason);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("sendToAppsScript failed", payload.id, err);
    return { ok: false };
  }
}
