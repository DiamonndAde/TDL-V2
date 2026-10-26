import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { company } from "@/content/facts";
import { PostCard } from "@/components/blog/post-card";
import { PostMeta } from "@/components/blog/post-meta";
import { CtaBand } from "@/components/layout/cta-band";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { getPost, getPosts, type Block } from "@/lib/blog";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.date },
  };
}

/** One post: title, date and reading time, the cover, the body in a reading column, then the other posts and the close. */
export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const others = (await getPosts()).filter((p) => p.slug !== post.slug).slice(0, 2);
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url: `${company.siteUrl}/blog/${post.slug}`,
    author: { "@id": `${company.siteUrl}/#organization` },
    publisher: { "@id": `${company.siteUrl}/#organization` },
  };
  return (
    <main id="main">
      <article>
        <header className="bg-mist">
          <div className="container-site py-14 lg:py-20">
            <div className="mx-auto max-w-3xl">
              <p className="mb-4 text-sm font-bold tracking-[0.06em] text-accent-strong uppercase">Blog</p>
              <h1 id="page-title" className="text-[2.25rem] leading-[1.15] sm:text-[2.75rem] lg:text-[3rem]">
                {post.title}
              </h1>
              <PostMeta date={post.date} minutes={post.readingMinutes} className="mt-5 text-base" />
            </div>
          </div>
        </header>
        <div className="bg-white">
          <div className="container-site pt-10 pb-16 lg:pt-14 lg:pb-24">
            <div className="mx-auto max-w-3xl">
              <PhotoFrame frame={post.cover} icon={Newspaper} aspect="aspect-[16/9]" sizes="(min-width: 48rem) 768px, 100vw" className="rounded-2xl" />
              <div className="mt-10 text-[1.0625rem] leading-[1.85]">
                {post.body.map((b, i) => (
                  <BodyBlock key={i} block={b} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>

      {others.length ? (
        <section aria-labelledby="more-title" className="bg-mist">
          <div className="container-site section-y">
            <h2 id="more-title" className="text-[2rem] leading-tight lg:text-[2.5rem]">
              More from the <span className="text-accent-strong">blog</span>
            </h2>
            <ul className="mt-10 grid gap-8 md:grid-cols-2">
              {others.map((p) => (
                <li key={p.slug}>
                  <PostCard post={p} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand title="Want this handled for you?" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </main>
  );
}

function BodyBlock({ block }: { block: Block }) {
  if (block.type === "h2") return <h2 className="mt-12 text-[1.625rem] leading-snug text-navy lg:text-[1.875rem]">{block.text}</h2>;
  if (block.type === "ul")
    return (
      <ul className="mt-5 list-disc space-y-2 pl-6 marker:text-accent-strong">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  return <p className="mt-5 first:mt-0">{block.text}</p>;
}
