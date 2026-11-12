"use client";

import { useEffect, useState } from "react";

export interface CarouselReview {
  displayName: string;
  text: string;
}

/** How long each review shows before the next one fades in (Peter, 2026-11-12). */
const ROTATE_MS = 1500;

/**
 * One review at a time. It moves on its own, and stops while the pointer is over it, while
 * it has keyboard focus, or when the visitor asks for reduced motion. The arrows fade in on
 * hover or focus. All slides share 1 grid cell, so the band keeps the height of the longest
 * review and the page does not jump.
 */
export function ReviewCarousel({ reviews }: { reviews: CarouselReview[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = reviews.length;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  useEffect(() => {
    if (paused || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  return (
    <div
      className="group flex w-full items-center gap-2 nav:gap-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {count > 1 && <ArrowButton direction="left" onClick={() => go(-1)} />}
      <div className="grid min-w-0 flex-1">
        {reviews.map((review, i) => {
          const active = i === index;
          return (
            <figure
              key={`${review.displayName}-${i}`}
              aria-hidden={!active}
              className={`col-start-1 row-start-1 m-0 flex flex-col justify-center gap-6 transition-[opacity,transform,visibility] duration-700 ease-out motion-reduce:transition-none ${
                active ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0"
              }`}
            >
              <blockquote className="m-0">
                <p className="text-center font-display text-[clamp(22px,2.4vw,32px)] leading-[1.45] italic">
                  “{review.text}”
                </p>
              </blockquote>
              <figcaption className="self-end text-[18px] font-bold tracking-[0.08em] uppercase">
                – {review.displayName}
              </figcaption>
            </figure>
          );
        })}
      </div>
      {count > 1 && <ArrowButton direction="right" onClick={() => go(1)} />}
    </div>
  );
}

function ArrowButton({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Previous review" : "Next review"}
      className="flex size-11 flex-none cursor-pointer items-center justify-center text-linen opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100 motion-reduce:transition-none"
    >
      <svg width="28" height="28" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
        {direction === "left" ? <path d="M12 4l-6 6 6 6" /> : <path d="M8 4l6 6-6 6" />}
      </svg>
    </button>
  );
}
