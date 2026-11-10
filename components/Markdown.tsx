import type { ReactNode } from "react";

// A small Markdown renderer for article bodies from the CMS. It builds React elements (no raw HTML),
// so CMS text can never inject markup. Supports: ## and ### headings, > quotes, - and 1. lists,
// paragraphs, **bold**, *italic* and [links](https://…).

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      out.push(text.slice(last, match.index));
    }
    const key = match.index;
    if (match[1] !== undefined) {
      out.push(<strong key={key}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      out.push(<em key={key}>{match[2]}</em>);
    } else {
      const href = match[4];
      const safe = /^(https?:|mailto:|tel:|\/|#)/.test(href);
      out.push(safe ? <a key={key} href={href}>{match[3]}</a> : match[3]);
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) {
    out.push(text.slice(last));
  }
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.trim().split(/\n{2,}/);

  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (block.startsWith("### ")) {
          return <h3 key={i}>{inline(block.slice(4))}</h3>;
        }
        if (block.startsWith("## ")) {
          return <h2 key={i}>{inline(block.slice(3))}</h2>;
        }
        if (lines.every((l) => l.startsWith(">"))) {
          return (
            <blockquote
              key={i}
              className="my-4 border-y border-forest py-2 font-display text-[clamp(22px,2.4vw,28px)] italic"
            >
              {inline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "))}
            </blockquote>
          );
        }
        if (lines.every((l) => /^[-*] /.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.slice(2))}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\d+\. /.test(l))) {
          return (
            <ol key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\d+\. /, ""))}</li>
              ))}
            </ol>
          );
        }
        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </>
  );
}
