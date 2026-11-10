import Link from "next/link";
import { CmsPicture } from "./ui";
import { formatDate, type PostSummary } from "@/lib/content/blog";

export function PostCard({ post, headingSize = "text-[26px]" }: { post: PostSummary; headingSize?: string }) {
  return (
    <article className="flex flex-col gap-3.5">
      <CmsPicture image={post.image} className="aspect-[3/2] w-full" />
      <p className="eyebrow">{post.topic}</p>
      <h3 className={headingSize}>
        <Link href={`/blog/${post.slug}`} className="no-underline hover:underline">
          {post.heading}
        </Link>
      </h3>
      <p>{post.dek}</p>
      <p className="text-small text-forest">
        {formatDate(post.publishDate)} · {post.readMinutes} min read
      </p>
    </article>
  );
}
