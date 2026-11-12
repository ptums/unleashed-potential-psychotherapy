"use client";

import { useState } from "react";

export interface CarouselReview {
  displayName: string;
  text: string;
}

/**
 * One review at a time, with Previous and Next buttons. It does not move on its own.
 * All slides share 1 grid cell, so the band keeps the height of the longest review and
 * the page does not jump when the slide changes.
 */
export function ReviewCarousel({ reviews }: { reviews: CarouselReview[] }) {
  const [index, setIndex] = useState(0);
  const count = reviews.length;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="grid w-full">
        {reviews.map((review, i) => (
          <figure
            key={`${review.displayName}-${i}`}
            aria-hidden={i !== index}
            className={`col-start-1 row-start-1 m-0 flex flex-col items-center justify-center gap-6 text-center ${
              i === index ? "" : "invisible"
            }`}
          >
            <blockquote className="m-0">
              <p className="font-display text-[clamp(22px,2.4vw,30px)] leading-[1.45] italic">“{review.text}”</p>
            </blockquote>
            <figcaption className="text-[18px] font-bold tracking-[0.08em] uppercase">{review.displayName}</figcaption>
          </figure>
        ))}
      </div>
      {count > 1 && (
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => go(-1)} aria-label="Previous review" className="btn min-h-11 px-4">
            <Arrow direction="left" />
          </button>
          <p aria-live="polite" className="min-w-16 text-center text-[16px]">
            <span className="sr-only">Review </span>
            {index + 1} / {count}
          </p>
          <button type="button" onClick={() => go(1)} aria-label="Next review" className="btn min-h-11 px-4">
            <Arrow direction="right" />
          </button>
        </div>
      )}
    </div>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      {direction === "left" ? <path d="M12 4l-6 6 6 6" /> : <path d="M8 4l6 6-6 6" />}
    </svg>
  );
}
