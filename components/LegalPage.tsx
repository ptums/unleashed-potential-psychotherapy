import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { getContent } from "@/lib/content";
import { formatDate } from "@/lib/content/blog";
import { seoMetadata } from "@/lib/seo";

// The Disclaimer and Privacy Policy pages share 1 CMS shape and 1 template: a plain text page
// in the site's fonts and styling (Jess, 2026-11-19).
// The Notice of Privacy Practices (UPTG-38) uses the same template. It has no mock copy on purpose: the
// page stays a 404 until the CMS publishes the text Jess and the attorney approved.
export type LegalPageId = "disclaimer" | "privacy-policy" | "notice-of-privacy-practices";

export async function legalMetadata(id: LegalPageId): Promise<Metadata> {
  return seoMetadata((await getContent().getPage(id))?.seo, { path: `/${id}` });
}

export async function LegalPage({ id }: { id: LegalPageId }) {
  const page = await getContent().getPage(id);
  if (!page) {
    notFound();
  }
  const { hero, body } = page;

  return (
    <article className="wrap pt-[clamp(56px,8vw,112px)] pb-[clamp(64px,8vw,112px)]">
      <div className="mx-auto flex max-w-[720px] flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-forest pb-8">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 className="text-h1">{hero.heading}</h1>
          {hero.lastUpdated && (
            <p className="text-small text-forest">
              Last updated <time dateTime={hero.lastUpdated}>{formatDate(hero.lastUpdated, "long")}</time>
            </p>
          )}
        </header>
        <div className="flex flex-col gap-5 text-[18px] leading-[1.75] [&_h2]:mt-6 [&_h2]:text-[28px] nav:[&_h2]:text-[32px] [&_h3]:mt-4 [&_h3]:text-2xl [&_ol]:m-0 [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:pl-6 [&_ul]:m-0 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-6">
          <Markdown source={body.content} />
        </div>
      </div>
    </article>
  );
}
