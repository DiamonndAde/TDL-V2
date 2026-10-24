import type { Metadata } from "next";
import Image from "next/image";
import { ClipboardList, MessageSquareQuote, Wrench } from "lucide-react";
import { caseStudies, testimonials } from "@/content/testimonials";
import { CtaBand } from "@/components/layout/cta-band";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { FeatureCard } from "@/components/ui/feature-card";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Three accounts of what Total Data Limited runs for its clients: Carlcare Development Nigeria, Chi Limited and Transsnet Music, in their own words.",
  alternates: { canonical: "/work" },
};

/**
 * The three accounts in full (preserved URL; the home testimonial cards link to `#<id>` here): situation, what TDL
 * ran, what the client said, then the whole quote it is built from. Nothing goes beyond what the clients have
 * published; no outcome figures (Q10). Naming the companies in this form needs written sign-off (Q21); the quotes
 * keep their original typos until corrections are permitted (Q22).
 */
export default function WorkPage() {
  return (
    <main id="main">
      <PageHeader
        eyebrow="Our work"
        title="What running someone else’s people"
        accent="actually involves."
        lead="Each account is in three parts: the situation the client was in, what TDL ran, and what the client said about it afterwards. Where a number would help and the client has not published one, none is given."
      />

      {caseStudies.map((c, i) => {
        const t = testimonials.find((x) => x.id === c.id)!;
        return (
          <section key={c.id} id={c.id} aria-labelledby={`${c.id}-title`} className={i % 2 ? "bg-mist" : "bg-white"}>
            <div className="container-site section-y">
              <div className="flex flex-wrap items-center gap-5">
                <Image src={t.logo.src} alt="" width={t.logo.width} height={t.logo.height} className="h-12 w-auto rounded bg-white object-contain p-1" />
                <div>
                  <h2 id={`${c.id}-title`} className="text-[1.75rem] leading-tight lg:text-[2.25rem]">
                    {c.company}
                  </h2>
                  <p className="mt-1 text-ink/75">{c.sector}</p>
                </div>
              </div>
              <Reveal as="ul" items=":scope > li" className="mt-10 grid gap-6 md:grid-cols-3">
                <li>
                  <FeatureCard icon={ClipboardList} title="The situation" align="left">
                    {c.situation}
                  </FeatureCard>
                </li>
                <li>
                  <FeatureCard icon={Wrench} title="What TDL ran" align="left">
                    {c.ran}
                  </FeatureCard>
                </li>
                <li>
                  <FeatureCard icon={MessageSquareQuote} title="What the client said" align="left">
                    {c.said}
                  </FeatureCard>
                </li>
              </Reveal>
              <Reveal as="figure" y={24} className="mt-10 rounded-2xl bg-white p-7 shadow-[0_10px_30px_rgb(15_23_42/0.06)] lg:p-12">
                <span aria-hidden="true" className="block font-display text-6xl leading-none font-bold text-accent">
                  “
                </span>
                <blockquote className="mt-2 max-w-[60rem] font-display text-lg leading-relaxed text-quote lg:text-xl">
                  {t.full.map((para) => (
                    <p key={para.slice(0, 40)} className="mt-4 first:mt-0">
                      {para}
                    </p>
                  ))}
                </blockquote>
                <figcaption className="mt-8">
                  <p className="font-display text-lg font-medium text-navy">{t.person}</p>
                  <p className="mt-0.5 text-sm text-ink/70">
                    {t.role}, {t.company}
                  </p>
                </figcaption>
              </Reveal>
            </div>
          </section>
        );
      })}

      <CtaBand title="Your account could be the fourth." />
    </main>
  );
}
