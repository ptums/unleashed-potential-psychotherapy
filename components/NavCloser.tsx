"use client";

import { useEffect } from "react";

/** Closes open nav menus (<details data-nav>) on Escape, outside click, or opening another one. */
export function NavCloser() {
  useEffect(() => {
    const menus = () => Array.from(document.querySelectorAll<HTMLDetailsElement>("details[data-nav]"));

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      for (const menu of menus()) {
        if (menu.open) {
          menu.open = false;
          menu.querySelector("summary")?.focus();
        }
      }
    };

    const onClick = (event: MouseEvent) => {
      for (const menu of menus()) {
        if (menu.open && !menu.contains(event.target as Node)) {
          menu.open = false;
        }
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
