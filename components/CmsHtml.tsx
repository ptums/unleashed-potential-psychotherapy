import sanitizeHtml from "sanitize-html";

// Rich text from the CMS editor arrives as HTML ("<p>...</p><p>...</p>").
// It is cleaned to a small allowlist before it renders, so a script, style or event
// handler in the content can never reach the page.
const options: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "a", "ul", "ol", "li"],
  allowedAttributes: { a: ["href", "title", "target", "rel"] },
  allowedSchemes: ["https", "http", "mailto", "tel"],
  transformTags: {
    // An external link opens in a new tab, without access to this page.
    a: (tagName, attribs) => ({
      tagName,
      attribs: /^https?:/i.test(attribs.href ?? "") ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs,
    }),
  },
};

// Article bodies also allow headings and quotes.
const articleOptions: sanitizeHtml.IOptions = {
  ...options,
  allowedTags: [...(options.allowedTags as string[]), "h2", "h3", "h4", "blockquote"],
};

/** True when the text holds HTML tags, so it renders as HTML and not as Markdown. */
export function looksLikeHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text.trim());
}

/** Cleans CMS HTML. Plain text with no tags becomes paragraphs, split at blank lines. */
export function cleanCmsHtml(html: string, article = false): string {
  const trimmed = html.trim();
  const source = looksLikeHtml(trimmed)
    ? trimmed
    : trimmed
        .split(/\n\s*\n/)
        .map((para) => `<p>${escapeText(para.trim())}</p>`)
        .join("");
  return sanitizeHtml(source, article ? articleOptions : options);
}

function escapeText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Renders CMS rich text. The HTML is sanitized first (see cleanCmsHtml). */
export function CmsHtml({ html, className = "", article = false }: { html: string; className?: string; article?: boolean }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: cleanCmsHtml(html, article) }} />;
}
