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

export async function sendToAppsScript(payload: Omit<AppsScriptPayload, "token">): Promise<{ ok: boolean }> {
  const url = process.env.APPS_SCRIPT_URL;
  const token = process.env.APPS_SCRIPT_TOKEN;
  if (!url || !token) {
    console.error("sendToAppsScript: APPS_SCRIPT_URL or APPS_SCRIPT_TOKEN is not set", payload.id);
    return { ok: false };
  }
  try {
    // An Apps Script web app answers a POST with a redirect to its output, so fetch follows it.
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, token }),
      redirect: "follow",
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!res.ok || !data?.ok) {
      console.error("sendToAppsScript failed", payload.id, res.status);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("sendToAppsScript failed", payload.id, err);
    return { ok: false };
  }
}
