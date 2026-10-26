import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import type { PostSummary } from "@/lib/blog";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { PostMeta } from "./post-meta";

/**
 * A post on the blog index and under "More from the blog": cover, date, the title as the link, excerpt. "Read the
 * post" repeats the title link for the eye only, so a keyboard or screen-reader user meets one link per card.
 */
export function PostCard({ post, headingLevel: H = "h2" }: { post: PostSummary; headingLevel?: "h2" | "h3" }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgb(15_23_42/0.06)]">
      <PhotoFrame frame={post.cover} icon={Newspaper} sizes="(min-width: 64rem) 384px, (min-width: 48rem) 50vw, 100vw" />
      <div className="flex flex-1 flex-col p-7">
        <PostMeta date={post.date} minutes={post.readingMinutes} />
        <H className="mt-3 text-[1.375rem] leading-snug text-navy">
          <Link href={`/blog/${post.slug}`} className="hover:text-accent-strong">
            {post.title}
          </Link>
        </H>
        <p className="mt-3 flex-1 text-ink/85">{post.excerpt}</p>
        <Link
          href={`/blog/${post.slug}`}
          aria-hidden="true"
          tabIndex={-1}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-accent-strong hover:underline"
        >
          Read the post
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
