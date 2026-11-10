import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { PostCard } from "@/components/PostCard";
import { CmsLinkTo, CmsPicture } from "@/components/ui";
import { ClosingCta } from "@/components/zones";
import { getContent, isZoneVisible, type BlogPost } from "@/lib/content";
import { formatDate, listPosts, relatedPosts, type PostSummary } from "@/lib/content/blog";
import { seoMetadata } from "@/lib/seo";

// Only posts with content get a page. Any other slug is a real 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getContent().listSlugs("blogPosts");
  return slugs.map((slug) => ({ slug }));
}

async function loadPost(slug: string) {
  return getContent().getEntry("blogPosts", slug);
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return seoMetadata((await loadPost(slug))?.seo);
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) {
    notFound();
  }
  const content = getContent();
  const h = post.articleHeader;
  const author = await content.getEntry("clinicians", h.author.id);
  const authorHref = author ? `/clinicians/${h.author.id}` : null;

  const all = await listPosts(content);
  const current = all.find((p) => p.slug === slug);
  let related: PostSummary[] = [];
  if (isZoneVisible(post.related) && current) {
    related =
      post.related.mode === "manual"
        ? (post.related.posts ?? [])
            .map((ref) => all.find((p) => p.slug === ref.id))
            .filter((p): p is PostSummary => p !== undefined)
        : relatedPosts(all, current);
  }

  return (
    <>
      <article>
        <header className="wrap flex flex-col gap-10 pt-6 pb-[clamp(40px,5vw,64px)]">
          <nav aria-label="Breadcrumb">
            <ol className="m-0 flex list-none flex-wrap gap-2 p-0 text-small">
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{h.topic}</li>
            </ol>
          </nav>
          <div className="mx-auto flex max-w-[860px] flex-col items-center gap-5 text-center">
            <p className="eyebrow">
              {h.topic} · {h.readMinutes} min read
            </p>
            <h1 className="text-[clamp(38px,4.8vw,64px)]">{h.heading}</h1>
            <p className="max-w-[32em] text-[20px]">{h.dek}</p>
            <p className="text-small text-forest">
              {author && authorHref && (
                <>
                  By <Link href={authorHref}>{author.profileHeader.displayName}</Link> ·{" "}
                </>
              )}
              <time dateTime={h.publishDate}>{formatDate(h.publishDate, "long")}</time>
            </p>
          </div>
          <CmsPicture image={h.image} className="mx-auto aspect-[21/9] w-full max-w-[1040px]" />
        </header>

        <div className="wrap pb-[clamp(64px,8vw,112px)]">
          <div className="mx-auto flex max-w-[680px] flex-col gap-6 text-[18px] leading-[1.75] nav:text-[19px] [&_h2]:mt-6 [&_h2]:text-[28px] nav:[&_h2]:text-[32px] [&_h3]:mt-4 [&_h3]:text-2xl [&_ol]:m-0 [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-2.5 [&_ol]:pl-6 [&_ul]:m-0 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2.5 [&_ul]:pl-6 [&_ol]:list-decimal">
            {isZoneVisible(post.body) && <Markdown source={post.body.content} />}
            {isZoneVisible(post.crisisCallout) && <CrisisCallout zone={post.crisisCallout} />}
            {isZoneVisible(post.authorBox) && author && authorHref && (
              <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-forest pt-8 text-body">
                <div aria-hidden="true" className="size-24 flex-none bg-cream" />
                <div className="flex flex-[1_1_280px] flex-col gap-1.5">
                  <p className="font-display text-[22px]">{author.profileHeader.displayName}</p>
                  <p>{post.authorBox.bio}</p>
                  <Link href={authorHref} className="font-bold">
                    {post.authorBox.linkLabel}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {related.length > 0 && isZoneVisible(post.related) && (
        <section aria-labelledby="related-heading" className="bg-cream-light py-[clamp(64px,8vw,112px)]">
          <div className="wrap flex flex-col gap-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="related-heading" className="text-[clamp(30px,3.2vw,42px)]">
                {post.related.heading}
              </h2>
              <CmsLinkTo link={post.related.allLink} className="font-bold" />
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-10">
              {related.map((p) => (
                <PostCard key={p.slug} post={p} headingSize="text-2xl" />
              ))}
            </div>
          </div>
        </section>
      )}

      {isZoneVisible(post.closingCta) && <ClosingCta zone={post.closingCta} />}
    </>
  );
}

/** Crisis callout. 988 and 911 in the CMS text become phone links. */
function CrisisCallout({ zone }: { zone: BlogPost["crisisCallout"] }) {
  const parts = zone.body.split(/\b(988|911)\b/);
  return (
    <aside aria-label="Crisis support" className="flex flex-col gap-2 bg-cream-light px-7 py-6 text-body leading-[1.65]">
      <p className="font-bold">{zone.heading}</p>
      <p>
        {parts.map((part, i) =>
          part === "988" || part === "911" ? (
            <a key={i} href={`tel:${part}`}>
              {part}
            </a>
          ) : (
            part
          ),
        )}
      </p>
    </aside>
  );
}
