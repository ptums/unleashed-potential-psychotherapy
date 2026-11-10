import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleList } from "@/components/ArticleList";
import { PostCard } from "@/components/PostCard";
import { CmsPicture } from "@/components/ui";
import { ClosingCta } from "@/components/zones";
import { getContent, isZoneVisible, type Blog } from "@/lib/content";
import { formatDate, listPosts, type PostSummary } from "@/lib/content/blog";
import { seoMetadata } from "@/lib/seo";

async function loadPage() {
  return getContent().getPage("blog");
}

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata((await loadPage())?.seo);
}

export default async function BlogIndexPage() {
  const page = await loadPage();
  if (!page) {
    notFound();
  }
  const content = getContent();
  const posts = await listPosts(content);

  let featured: PostSummary | undefined;
  if (isZoneVisible(page.featuredPost)) {
    const manualId = page.featuredPost.mode === "manual" ? page.featuredPost.post?.id : undefined;
    featured = manualId ? posts.find((p) => p.slug === manualId) : posts[0];
  }
  const authorName = featured
    ? (await content.getEntry("clinicians", featured.authorId))?.profileHeader.displayName
    : undefined;

  return (
    <>
      {isZoneVisible(page.hero) && <Hero zone={page.hero} />}
      {featured && isZoneVisible(page.featuredPost) && (
        <Featured zone={page.featuredPost} post={featured} authorName={authorName} />
      )}
      {isZoneVisible(page.articleList) && (
        <ArticleList
          heading={page.articleList.heading}
          topics={page.articleList.topics}
          allLabel={page.articleList.allTopicsLabel}
          pageSize={page.articleList.pageSize}
          emptyMessage={page.articleList.emptyMessage}
          items={posts.map((post) => ({ slug: post.slug, topic: post.topic, card: <PostCard post={post} /> }))}
        />
      )}
      {isZoneVisible(page.closingCta) && <ClosingCta zone={page.closingCta} />}
    </>
  );
}

function Hero({ zone }: { zone: Blog["hero"] }) {
  return (
    <section className="pt-[clamp(64px,8vw,112px)] pb-[clamp(40px,5vw,64px)]">
      <div className="wrap mx-auto flex max-w-[920px] flex-col items-center gap-5 text-center">
        <p className="eyebrow">{zone.eyebrow}</p>
        <h1 className="text-h1">{zone.heading}</h1>
        {zone.intro && <p className="max-w-[32em] text-[20px]">{zone.intro}</p>}
      </div>
    </section>
  );
}

function Featured({
  zone,
  post,
  authorName,
}: {
  zone: Blog["featuredPost"];
  post: PostSummary;
  authorName?: string;
}) {
  const href = `/blog/${post.slug}`;
  return (
    <section aria-labelledby="featured-heading" className="wrap pb-[clamp(56px,7vw,96px)]">
      <article className="grid grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-center gap-[clamp(32px,5vw,72px)] border-t border-forest pt-[clamp(40px,5vw,64px)]">
        <CmsPicture image={post.image} className="aspect-[4/3] w-full" />
        <div className="flex flex-col gap-4">
          <p className="eyebrow">
            {zone.eyebrow} · {post.topic}
          </p>
          <h2 id="featured-heading" className="text-[clamp(30px,3.4vw,46px)]">
            <Link href={href} className="no-underline hover:underline">
              {post.heading}
            </Link>
          </h2>
          <p>{post.dek}</p>
          <p className="text-small text-forest">
            {[authorName, formatDate(post.publishDate), `${post.readMinutes} min read`].filter(Boolean).join(" · ")}
          </p>
          <Link href={href} className="btn min-h-11 self-start px-5 py-2.5 text-label">
            {zone.ctaLabel}
            <span className="sr-only">: {post.heading}</span>
          </Link>
        </div>
      </article>
    </section>
  );
}
