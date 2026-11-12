"use client";

import { useSyncExternalStore } from "react";
import { ToastContainer } from "react-toastify";

// Ported from jessrebelo.com (components/layout/ToastContainer.tsx there): top right on
// desktop, top center on phones, closes after 5 seconds. Colors are set in globals.css.

const PHONE = "(max-width: 768px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(PHONE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function Toasts() {
  const isPhone = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PHONE).matches,
    () => false,
  );

  return (
    <ToastContainer
      position={isPhone ? "top-center" : "top-right"}
      autoClose={5000}
      newestOnTop={false}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
}
