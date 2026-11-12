import Link from "next/link";
import type { ReactNode } from "react";

/**
 * A button that stays in the upper right while the page scrolls. The labels are static:
 * "Share your experience" on Reviews, and later "Book with {first name}" on each clinician profile. It sits above the content and below the
 * open nav menus. globals.css adds scroll padding on pages that have it, so it never covers focus.
 */
export function FloatingAction({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <Link
      href={href}
      data-floating-action
      className="fixed top-24 right-4 z-20 inline-flex min-h-13 items-center gap-2.5 bg-cream px-[18px] py-3 text-[14px] leading-[1.2] font-bold tracking-[0.08em] text-forest-dark uppercase no-underline shadow-[0_10px_28px_rgba(49,70,75,.28),0_2px_6px_rgba(49,70,75,.18)] transition-[background-color,box-shadow] hover:bg-cream-dark hover:shadow-[0_14px_32px_rgba(49,70,75,.32),0_3px_8px_rgba(49,70,75,.2)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest-dark motion-reduce:transition-none nav:top-27 nav:right-6 nav:px-6 nav:py-3.5 nav:text-[15px]"
    >
      <span aria-hidden="true" className="flex">
        {icon}
      </span>
      {label}
    </Link>
  );
}

/** The pen icon for the feedback button. */
export function PenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h4L19 9l-4-4L4 16v4z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}
