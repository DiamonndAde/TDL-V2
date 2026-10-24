import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Handshake, MapPin, Target } from "lucide-react";
import { about, boardOfAdvisory, leadershipTeam, type Person } from "@/content/about";
import { company, values } from "@/content/facts";
import { CtaBand } from "@/components/layout/cta-band";
import { PageHeader } from "@/components/layout/page-header";
import { QuotePanel } from "@/components/home/quote-panel";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { FeatureCard } from "@/components/ui/feature-card";
import { Monogram } from "@/components/ui/monogram";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "About",
  description:
    "Total Data Limited: a management consultancy incorporated in 2000, running HR and business process outsourcing across Nigeria and Benin Republic. Leadership, board, values.",
  alternates: { canonical: "/about-us" },
};

/**
 * The human page (preserved URL): the story in plain facts, vision and mission verbatim, the SPICE values, management
 * and board in their own words (about.ts: verbatim; Q5 spelling kept), the MD's garden quote, and where the firm is.
 * Named people get initials until their headshots arrive (Q18): never a face. The office frame names TDL's address, so
 * it never shows a photograph that is not TDL's; it is an address card until their own photograph exists.
 */
export default function AboutPage() {
  return (
    <main id="main">
      <JsonLd />
      <PageHeader
        eyebrow="About us"
        title="Other companies’ people, run as"
        accent="one firm."
        lead={about.story[0]}
        aside={
          <PhotoFrame frame="about" icon={Handshake} aspect="aspect-[4/3]" sizes="(min-width: 64rem) 448px, 100vw" className="rounded-lg" />
        }
      />

      <section aria-labelledby="direction-title" className="bg-white">
        <div className="container-site section-y">
          <SectionHeading id="direction-title" before="Where we are" accent="going" />
          <p className="mt-6 max-w-[42rem] text-[1.0625rem]">{about.story[1]}</p>
          <Reveal as="ul" items=":scope > li" className="mt-10 grid gap-6 md:grid-cols-2">
            <li>
              <FeatureCard icon={Eye} title="Vision" align="left">
                {about.vision}
              </FeatureCard>
            </li>
            <li>
              <FeatureCard icon={Target} title="Mission" align="left">
                {about.mission}
              </FeatureCard>
            </li>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="values-title" className="bg-mist">
        <div className="container-site section-y">
          <SectionHeading id="values-title" before="Core values:" accent="SPICE" />
          <Reveal as="ul" items=":scope > li" className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
            {values.map((v) => (
              <li key={v.letter} className="rounded-lg bg-white p-6 text-center shadow-[0_15px_40px_rgb(15_23_42/0.06)]">
                <span aria-hidden="true" className="block font-display text-5xl font-bold text-accent-strong">
                  {v.letter}
                </span>
                <span className="mt-3 block font-display text-lg font-medium text-navy">{v.name}</span>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <People id="management" heading={["Our", "management"]} people={leadershipTeam} />
      <People id="board" heading={["Board of", "advisory"]} people={boardOfAdvisory} tinted />

      <QuotePanel />

      <section aria-labelledby="office-title" className="bg-white">
        <div className="container-site pb-16 lg:pb-24">
          <SectionHeading id="office-title" before="Where to" accent="find us" />
          <div className="mt-8 flex flex-col gap-6 rounded-lg bg-navy p-8 text-white sm:flex-row sm:items-center lg:p-10">
            <MapPin className="size-12 shrink-0 text-accent-on-dark" strokeWidth={1.5} aria-hidden="true" />
            <div className="flex-1">
              <p className="text-xl font-bold">
                {company.address.street}, {company.address.locality}, {company.address.region}
              </p>
              <p className="mt-1 text-on-dark-muted">
                Managing staff across Nigeria and in Benin Republic. Quality policy, objectives and the ISO certification
                are on the{" "}
                <Link href="/certifications" className="font-bold text-accent-on-dark underline underline-offset-4">
                  certifications page
                </Link>
                .
              </p>
            </div>
            <Link href="/contact-us" className="font-bold text-white underline decoration-accent-on-dark decoration-2 underline-offset-[6px]">
              Contact us
            </Link>
          </div>
        </div>
      </section>

      <CtaBand title="Put your people in steady hands." />
    </main>
  );
}

function People({ id, heading, people, tinted = false }: { id: string; heading: [string, string]; people: Person[]; tinted?: boolean }) {
  return (
    <section aria-labelledby={`${id}-title`} className={tinted ? "bg-mist" : "bg-white"}>
      <div className="container-site section-y">
        <SectionHeading id={`${id}-title`} before={heading[0]} accent={heading[1]} />
        <ul className="mt-10 space-y-6">
          {people.map((p) => (
            <li key={p.name}>
              <Reveal className="flex flex-col gap-6 rounded-lg bg-white p-7 shadow-[0_15px_40px_rgb(15_23_42/0.06)] sm:flex-row lg:gap-10 lg:p-10">
                <Monogram name={p.name} />
                <div>
                  <h3 className="text-2xl text-navy">{p.name}</h3>
                  <p className="mt-1 font-bold text-accent-strong">{p.role}</p>
                  {p.letters ? <p className="mt-1 text-sm text-ink/70">{p.letters}</p> : null}
                  {p.bio.map((para) => (
                    <p key={para.slice(0, 40)} className="mt-4 max-w-[70ch]">
                      {para}
                    </p>
                  ))}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
