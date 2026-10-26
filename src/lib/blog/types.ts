import type { DemoFrame } from "@/content/placeholders";

/**
 * The blog's data shape, owned by the site rather than by any content source. Today the posts are local files
 * (src/content/blog); a CMS such as Sanity replaces that by mapping its documents into these same types inside
 * src/lib/blog/index.ts, and no page changes (docs/DESIGN-DECISIONS.md, 2026-10-26).
 *
 * The body is a list of blocks rather than Markdown or HTML: plain text in typed blocks renders without a parser
 * or `dangerouslySetInnerHTML`, and maps one-to-one onto Sanity's Portable Text (block styles `normal` and `h2`,
 * bullet lists).
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export interface PostSummary {
  slug: string;
  title: string;
  /** One or two sentences for the index card and the meta description. */
  excerpt: string;
  /** ISO date, yyyy-mm-dd. */
  date: string;
  /** Minutes to read, computed from the body. */
  readingMinutes: number;
  /** The cover's photograph frame: TDL's own photograph, a demo image in presentation builds, else a brand panel. */
  cover: DemoFrame;
}

export interface Post extends PostSummary {
  body: Block[];
}
