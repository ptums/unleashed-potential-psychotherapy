"use client";

import { useId, useState } from "react";

/**
 * A review's text. A long review shows 5 lines and a button that toggles the rest.
 * The full text is always in the DOM: the clamp is visual only.
 */
export function ReviewText({
  text,
  long,
  expandLabel,
  collapseLabel,
}: {
  text: string;
  long: boolean;
  expandLabel: string;
  collapseLabel: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const clamped = long && !open;

  return (
    <>
      <blockquote className="m-0">
        <p id={id} className={`max-w-[40em] text-[18px] leading-[1.7] whitespace-pre-line ${clamped ? "line-clamp-5" : ""}`}>
          {text}
        </p>
      </blockquote>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
          className="min-h-11 cursor-pointer self-start font-bold underline underline-offset-4"
        >
          {open ? collapseLabel : expandLabel}
        </button>
      )}
    </>
  );
}
