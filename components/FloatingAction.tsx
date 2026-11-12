import Link from "next/link";
import type { ReactNode } from "react";

/**
 * A button that stays in the upper right while the page scrolls. The labels are static:
 * "Share your experience" on Reviews, and later "Book with {first name}" on each clinician profile. It sits above the content and below the
 * open nav menus. globals.css adds scroll padding on pages that have it, so it never covers focus.
 */
export function FloatingAction({ href, label, icon }: { href?: string; label: string; icon: ReactNode }) {
  const content = (
    <>
      <span aria-hidden="true" className="flex">
        {icon}
      </span>
      {label}
    </>
  );
  // No href yet (booking waits for the Google Calendar phase): a button that does nothing.
  if (!href) {
    return (
      <button type="button" data-floating-action className={`cursor-pointer border-0 ${floatingClass}`}>
        {content}
      </button>
    );
  }
  return (
    <Link href={href} data-floating-action className={floatingClass}>
      {content}
    </Link>
  );
}

const floatingClass =
  "fixed top-24 right-4 z-20 inline-flex min-h-13 items-center gap-2.5 bg-cream px-[18px] py-3 text-[14px] leading-[1.2] font-bold tracking-[0.08em] text-forest-dark uppercase no-underline shadow-[0_10px_28px_rgba(49,70,75,.28),0_2px_6px_rgba(49,70,75,.18)] transition-[background-color,box-shadow,translate] hover:-translate-y-px hover:bg-cream-dark hover:shadow-[0_14px_32px_rgba(49,70,75,.32),0_3px_8px_rgba(49,70,75,.2)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest-dark motion-reduce:transition-none nav:top-27 nav:right-6 nav:px-6 nav:py-3.5 nav:text-[15px]";

/** The calendar-check icon for the booking button. */
export function CalendarCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="1.5" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <path d="M9 15.5l2 2 4-4" />
    </svg>
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
