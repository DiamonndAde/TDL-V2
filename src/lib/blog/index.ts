import { cacheLife } from "next/cache";
import { localPosts } from "@/content/blog/posts";
import type { Block, Post, PostSummary } from "./types";

export type { Block, Post, PostSummary };

/**
 * The only way the site reads blog posts. Pages call `getPosts()` and `getPost(slug)` and never import a content
 * source; the boundary check fails if anything outside src/lib/blog imports src/content/blog.
 *
 * Today the source is local content files. To move to a CMS (Sanity, say), replace the two function bodies with a
 * query and map each document to `Post`; the signatures, the types and every page stay as they are. Both functions
 * are already async and cached (`"use cache"`), so a network source keeps every page static under
 * `ensureStatic = "navigation"`, refreshed on the cache lifetime or by revalidating the tag from a CMS webhook.
 */
export async function getPosts(): Promise<PostSummary[]> {
  "use cache";
  cacheLife("days");
  return localPosts
    .map(({ body, ...summary }) => ({ ...summary, readingMinutes: readingMinutes(body) }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export async function getPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheLife("days");
  const post = localPosts.find((p) => p.slug === slug);
  return post ? { ...post, readingMinutes: readingMinutes(post.body) } : null;
}

/** About 200 words a minute, never less than one. */
function readingMinutes(body: Block[]): number {
  const words = body
    .flatMap((b) => (b.type === "ul" ? b.items : [b.text]))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
