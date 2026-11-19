"use client";

import { useEffect, useRef, useState } from "react";

export interface CarouselReview {
  displayName: string;
  text: string;
}

/** How long the row waits before it moves on by 1 card (Peter, 2026-11-12: 4.5 seconds). */
const ROTATE_MS = 4500;

/** Scrolls the row by 1 card. Past the last card it goes back to the start, and the reverse. */
function scrollStep(el: HTMLElement | null, direction: 1 | -1) {
  if (!el) {
    return;
  }
  const card = el.querySelector("li");
  const width = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "0") : el.clientWidth;
  const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
  const atStart = el.scrollLeft <= 4;
  if (direction === 1 && atEnd) {
    el.scrollTo({ left: 0, behavior: "smooth" });
  } else if (direction === -1 && atStart) {
    el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
  } else {
    el.scrollBy({ left: direction * width, behavior: "smooth" });
  }
}

/**
 * A row of review cards: 3 at a time on a wide screen, 1 and a bit on a phone, so the visitor
 * sees there is more (Tailwind sorts the px "nav" breakpoint before rem ones, so no "sm" step). It is a native scroll row with snap points, so touch, trackpad and
 * keyboard scrolling all work. It moves on by 1 card on its own, and stops while the pointer is
 * over it, while it has keyboard focus, or when the visitor asks for reduced motion. At the end
 * it goes back to the start. Each card links to the full review on /reviews.
 */
export function ReviewCarousel({ reviews, moreHref }: { reviews: CarouselReview[]; moreHref?: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const count = reviews.length;

  useEffect(() => {
    if (paused || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => scrollStep(track.current, 1), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  return (
    <div
      className="flex min-w-0 flex-col gap-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ul
        ref={track}
        aria-label="Client reviews"
        className="m-0 grid w-full min-w-0 list-none auto-cols-[85%] grid-flow-col gap-5 overflow-x-auto overscroll-x-contain scroll-smooth p-0 pb-2 [scrollbar-width:none] snap-x snap-mandatory nav:auto-cols-[calc((100%-40px)/3)] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review, i) => (
          <li key={`${review.displayName}-${i}`} className="relative snap-start">
            <figure className="m-0 flex h-full flex-col gap-5 border border-forest bg-linen p-7">
              <span aria-hidden="true" className="font-display text-[56px] leading-[0.5] text-forest">
                “
              </span>
              <blockquote className="m-0 flex-1">
                <p className="font-display text-[20px] leading-[1.5] italic">{review.text}</p>
              </blockquote>
              <figcaption className="flex items-center justify-between gap-4 border-t border-forest pt-4">
                <span className="text-[15px] font-bold tracking-[0.08em] uppercase">{review.displayName}</span>
                {moreHref && (
                  <a href={moreHref} className="text-small">
                    Read more<span className="sr-only"> from {review.displayName}</span>
                  </a>
                )}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      {count > 1 && (
        <div className="flex justify-end gap-2">
          <ArrowButton direction="left" onClick={() => scrollStep(track.current, -1)} />
          <ArrowButton direction="right" onClick={() => scrollStep(track.current, 1)} />
        </div>
      )}
    </div>
  );
}

function ArrowButton({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Previous reviews" : "Next reviews"}
      className="flex size-11 flex-none cursor-pointer items-center justify-center border border-forest transition-colors duration-150 hover:bg-cream"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        {direction === "left" ? <path d="M12 4l-6 6 6 6" /> : <path d="M8 4l6 6-6 6" />}
      </svg>
    </button>
  );
}
