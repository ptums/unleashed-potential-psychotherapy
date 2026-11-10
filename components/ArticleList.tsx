"use client";

import { useState, type ReactNode } from "react";

export interface ArticleListItem {
  slug: string;
  topic: string;
  card: ReactNode;
}

/** The "All articles" grid with a topic filter. Cards are rendered on the server and passed in. */
export function ArticleList({
  items,
  topics,
  allLabel,
  pageSize,
  emptyMessage,
  heading,
}: {
  items: ArticleListItem[];
  topics: string[];
  allLabel: string;
  pageSize: number;
  emptyMessage: string;
  heading: string;
}) {
  const [topic, setTopic] = useState<string | null>(null);
  const [shown, setShown] = useState(pageSize);

  const filtered = topic ? items.filter((item) => item.topic === topic) : items;
  const visible = filtered.slice(0, shown);
  const filters = [{ label: allLabel, value: null }, ...topics.map((t) => ({ label: t, value: t }))];

  return (
    <section aria-labelledby="all-heading" className="wrap flex flex-col gap-10 pb-[clamp(72px,9vw,128px)]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 id="all-heading" className="text-[clamp(30px,3.2vw,42px)]">
          {heading}
        </h2>
        <ul aria-label="Filter by topic" className="m-0 flex list-none flex-wrap gap-2.5 p-0">
          {filters.map((f) => {
            const pressed = topic === f.value;
            return (
              <li key={f.label}>
                <button
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => {
                    setTopic(f.value);
                    setShown(pageSize);
                  }}
                  className={`min-h-11 cursor-pointer border border-forest px-4 text-small transition-colors ${
                    pressed ? "bg-forest-dark text-linen" : "hover:bg-cream-light"
                  }`}
                >
                  {f.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <p aria-live="polite" className="text-small text-forest">
        {filtered.length === 0
          ? emptyMessage
          : `${filtered.length} ${filtered.length === 1 ? "article" : "articles"}${topic ? ` in ${topic}` : ""}`}
      </p>
      {visible.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-x-10 gap-y-14">
          {visible.map((item) => (
            <div key={item.slug}>{item.card}</div>
          ))}
        </div>
      )}
      {filtered.length > shown && (
        <button type="button" className="btn self-center" onClick={() => setShown(shown + pageSize)}>
          Show more articles
        </button>
      )}
    </section>
  );
}
