import type { Metadata } from "next";
import { PostCard } from "@/components/blog/post-card";
import { CtaBand } from "@/components/layout/cta-band";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { getPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Practical writing from Total Data Limited on HR outsourcing, payroll, recruitment and running people well.",
  alternates: { canonical: "/blog" },
};

/**
 * The blog index (TDL, 2026-10-26). It replaces the /insights stub; /insights and /Blog redirect here. Posts come from
 * getPosts() in src/lib/blog, never from a content file directly, so a CMS can replace the source without touching
 * this page.
 */
export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <main id="main">
      <PageHeader
        eyebrow="Blog"
        title="Practical notes on HR, payroll"
        accent="and hiring."
        lead="Written by the Total Data Limited team, from the work of running people for organisations across Nigeria and Benin Republic."
      />
      <section aria-label="Posts" className="bg-white">
        <div className="container-site section-y">
          <Reveal as="ul" items=":scope > li" className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </Reveal>
        </div>
      </section>
      <CtaBand title="Want this handled for you?" />
    </main>
  );
}
