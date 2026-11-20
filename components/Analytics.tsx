"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { UNTRACKED_PATH_PATTERN, isUntrackedPath } from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4 with the form pages left out (UPTG-38).
 *
 * The site sends its own page views, so it can skip /book and /reviews/share:
 * - The config call sets send_page_view to false, and the GA4 stream has "page changes based on
 *   browser history events" turned off. Then GA never sends a page view on its own.
 * - GA checks the official ga-disable-<ID> flag before every hit. The inline script sets it for a
 *   visitor who lands on a form page; on each route change this component sets it again, then
 *   sends the page view only for pages outside the form pages.
 */
export function Analytics({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const disableKey = `ga-disable-${gaId}`;
  // The inline script handles the page the visitor lands on; this effect handles later route changes.
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const untracked = isUntrackedPath(pathname);
    (window as unknown as Record<string, boolean>)[disableKey] = untracked;
    if (!untracked) {
      window.gtag?.("event", "page_view", { page_path: pathname, page_location: window.location.href });
    }
  }, [disableKey, pathname]);

  const init = [
    "window.dataLayer = window.dataLayer || [];",
    "window.gtag = function gtag(){ window.dataLayer.push(arguments); };",
    `var untracked = new RegExp(${JSON.stringify(UNTRACKED_PATH_PATTERN)}).test(location.pathname.replace(/\\/+$/, "") || "/");`,
    `window[${JSON.stringify(disableKey)}] = untracked;`,
    "window.gtag('js', new Date());",
    `window.gtag('config', ${JSON.stringify(gaId)}, { send_page_view: false });`,
    "if (!untracked) { window.gtag('event', 'page_view', { page_path: location.pathname, page_location: location.href }); }",
  ].join("\n");

  return (
    <>
      <Script id="ga-init" strategy="afterInteractive">
        {init}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
    </>
  );
}
