import type { BlogPost, ContentRepository } from "./types";

export interface PostSummary {
  slug: string;
  topic: string;
  heading: string;
  dek: string;
  publishDate: string;
  readMinutes: number;
  image: BlogPost["articleHeader"]["image"];
  authorId: string;
}

function summarize(slug: string, post: BlogPost): PostSummary {
  const h = post.articleHeader;
  return {
    slug,
    topic: h.topic,
    heading: h.heading,
    dek: h.dek,
    publishDate: h.publishDate,
    readMinutes: h.readMinutes,
    image: h.image,
    authorId: h.author.id,
  };
}

/** Every post, newest first. */
export async function listPosts(content: ContentRepository): Promise<PostSummary[]> {
  const slugs = await content.listSlugs("blogPosts");
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const post = await content.getEntry("blogPosts", slug);
      return post ? summarize(slug, post) : null;
    }),
  );
  return posts
    .filter((p): p is PostSummary => p !== null)
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

/** Up to `limit` other posts: same topic first, then the newest. */
export function relatedPosts(all: PostSummary[], current: PostSummary, limit = 3): PostSummary[] {
  const others = all.filter((p) => p.slug !== current.slug);
  const sameTopic = others.filter((p) => p.topic === current.topic);
  const rest = others.filter((p) => p.topic !== current.topic);
  return [...sameTopic, ...rest].slice(0, limit);
}

/** "Oct 14, 2026" (short) or "October 14, 2026" (long). Dates are calendar dates, so format in UTC. */
export function formatDate(isoDate: string, style: "short" | "long" = "short"): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    month: style,
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
