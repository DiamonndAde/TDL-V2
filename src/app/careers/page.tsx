import type { Metadata } from "next";
import { HeartHandshake, Send, Sparkles, UserSearch } from "lucide-react";
import { company } from "@/content/facts";
import { careers } from "@/content/about";
import { ApplicationForm } from "@/components/careers/application-form";
import { OpeningsLink } from "@/components/careers/openings-link";
import { CtaBand } from "@/components/layout/cta-band";
import { PageHeader } from "@/components/layout/page-header";
import { PageViewed } from "@/components/layout/page-viewed";
import { Reveal } from "@/components/motion/reveal";
import { ButtonPill } from "@/components/ui/button-pill";
import { FeatureCard } from "@/components/ui/feature-card";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { SectionHeading } from "@/components/ui/section-heading";
import { WhatsAppMark } from "@/components/ui/whatsapp-mark";
import { openingsLinkFor } from "@/lib/recruitment";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Work at Total Data Limited or join the talent pool for roles with the clients whose people TDL manages across Nigeria and Benin Republic.",
  alternates: { canonical: "/careers" },
};

/**
 * One careers page (change 4: WordPress had CAREER and JOB OPENINGS as duplicates; /career, /job-openings and /jobs
 * redirect here). Open roles first, then the talent pool for people whose role is not listed, then the firm's own
 * words on working here. Open roles live in TDL's applicant tracking system, linked rather than duplicated (Q14); the
 * link comes from the recruitment adapter, so this page names no provider (Q29). Diversity and perks text is verbatim.
 */
export default function CareersPage() {
  // Decorated by the adapter with a source marker when one is configured (Q29f).
  const board = openingsLinkFor("totaldatalimited.com/careers");
  return (
    <main id="main">
      <PageViewed event={{ name: "careers_viewed" }} />
      <PageHeader
        eyebrow="Careers"
        title="Roles with us, and with the companies"
        accent="whose people we run."
        lead={
          board
            ? "Apply for a role that is open now, or join the talent pool and we will contact you when one matches."
            : "Join the talent pool below and we will contact you when a role matches."
        }
        aside={
          <PhotoFrame frame="service:recruitment-background-check" icon={UserSearch} aspect="aspect-[4/3]" sizes="(min-width: 64rem) 448px, 100vw" className="rounded-lg" />
        }
      />

      {/* Open roles: first, as TDL asked. Without a board configured the section is left out and the talent pool is
          the only route. */}
      {board ? (
        <section id="open-roles" aria-labelledby="open-roles-title" className="bg-white">
          <div className="container-site section-y">
            <SectionHeading id="open-roles-title" before="Open" accent="roles" />
            <p className="mt-6 max-w-[40rem] text-[1.0625rem]">
              Every role we are hiring for, at TDL and at the companies whose people we run, is listed on our recruitment
              portal. You apply there.
            </p>
            <div className="mt-8">
              <OpeningsLink href={board} />
            </div>
          </div>
        </section>
      ) : null}

      {/* TDL's job groups (2026-10-26). Links from facts.ts; both open in a new tab. Each accessible name starts with the
          visible label (WCAG 2.5.3). */}
      <section id="job-groups" aria-labelledby="job-groups-title" className="on-dark bg-charcoal">
        <div className="container-site py-14 lg:py-16">
          <SectionHeading id="job-groups-title" before="Join our" accent="job groups" onDark />
          <p className="mt-5 max-w-[40rem] text-on-dark-muted">We post new openings in our WhatsApp and Telegram groups. Join either one to hear about roles as they come up.</p>
          <div className="mt-8 flex flex-wrap gap-5">
            <ButtonPill href={company.jobGroups.whatsapp} external ariaLabel="Join on WhatsApp: our job group (opens in a new tab)">
              <WhatsAppMark />
              Join on WhatsApp
            </ButtonPill>
            <ButtonPill href={company.jobGroups.telegram} external tone="light" ariaLabel="Join on Telegram: our job group (opens in a new tab)">
              <Send size={18} aria-hidden="true" />
              Join on Telegram
            </ButtonPill>
          </div>
        </div>
      </section>

      <section id="talent-pool" aria-labelledby="talent-pool-title" className="bg-mist">
        <div className="container-site section-y">
          <SectionHeading id="talent-pool-title" before="Join the" accent="talent pool" />
          <p className="mt-6 max-w-[40rem] text-[1.0625rem]">If your role is not listed, leave your details. When one matches, we get in touch.</p>
          <div className="mt-10 max-w-3xl rounded-2xl bg-white p-6 shadow-[0_15px_40px_rgb(15_23_42/0.08)] sm:p-10">
            <ApplicationForm />
          </div>
        </div>
      </section>

      <section aria-labelledby="working-here-title" className="bg-white">
        <div className="container-site section-y">
          <SectionHeading id="working-here-title" before="Working" accent="here" />
          <Reveal as="ul" items=":scope > li" className="mt-10 grid gap-6 lg:grid-cols-2">
            <li>
              <FeatureCard icon={HeartHandshake} title="Diversity and inclusion" align="left">
                {careers.diversity}
              </FeatureCard>
            </li>
            <li>
              <FeatureCard icon={Sparkles} title="Perks and benefits" align="left">
                {careers.perks}
              </FeatureCard>
            </li>
          </Reveal>
        </div>
      </section>

      <CtaBand title="Hiring for your own team?" lead="We recruit, screen and run the people for the companies we work with. One of our representatives will contact you within 24 hours." />
    </main>
  );
}
