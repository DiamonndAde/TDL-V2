import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Insights",
  description: "Writing from Total Data Limited.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/insights" },
};

/**
 * The original site's "Blog" was a dead link (Q13), as were the WordPress build's BLOG and PROJECTS. The route exists
 * so /Blog and /blog redirect somewhere real and a first post has a home; it stays out of the navigation, the sitemap
 * and the index until there is content.
 */
export default function InsightsPage() {
  return (
    <main id="main">
      <PageHeader
        eyebrow="Insights"
        title="Nothing published"
        accent="yet."
        lead={
          <>
            When TDL publishes writing on running people at scale, it will live here. Until then, the{" "}
            <Link href="/work" className="font-bold text-accent-strong underline underline-offset-4">
              three accounts of client work
            </Link>{" "}
            are the best reading on the site.
          </>
        }
      />
    </main>
  );
}
