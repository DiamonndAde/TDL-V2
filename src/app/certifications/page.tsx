import type { Metadata } from "next";
import Image from "next/image";
import { FileCheck2, FileText, Hourglass } from "lucide-react";
import { certifications } from "@/content/about";
import { company } from "@/content/facts";
import { CtaBand } from "@/components/layout/cta-band";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Certifications",
  description:
    "Total Data Limited is ISO 9001:2015 certified and operates under the Nigeria Data Protection Regulations 2019. Quality policy and objectives.",
  alternates: { canonical: "/certifications" },
};

/**
 * What can be shown today (preserved URL): the ISO 9001:2015 badge, the quality policy and objectives (TDL's own
 * PDFs) and the NDPR statement. The certificate itself and any operating licences are rows that say "to come" rather
 * than being left out (TODO(client): Q19). The Why-TDL card "Uncompromised compliance" links here.
 */
export default function CertificationsPage() {
  return (
    <main id="main">
      <PageHeader
        eyebrow="Certifications"
        title="Certified to ISO 9001:2015,"
        accent="run under the NDPR."
        lead={`Quality management certified to ${certifications.iso.name}. Personal data handled under the ${company.ndpr}.`}
        aside={
          <div className="flex justify-center lg:justify-end">
            <Image src={certifications.iso.badge} alt="ISO 9001:2015 certified" width={200} height={200} className="size-40 object-contain lg:size-52" />
          </div>
        }
      />

      <section aria-labelledby="documents-title" className="bg-white">
        <div className="container-site section-y">
          <h2 id="documents-title" className="text-[2rem] leading-tight lg:text-[2.6875rem]">
            Documents
          </h2>
          <Reveal as="ul" items=":scope > li" className="mt-10 grid gap-4 md:grid-cols-2">
            {certifications.documents.map((d) => (
              <li key={d.href} className="flex items-center gap-5 rounded-lg bg-white p-6 shadow-[0_15px_40px_rgb(15_23_42/0.08)]">
                <FileText className="size-10 shrink-0 text-accent-strong" strokeWidth={1.5} aria-hidden="true" />
                <span className="flex-1 font-display text-lg font-medium text-navy">{d.name}</span>
                <a href={d.href} className="font-bold text-accent-strong underline decoration-2 underline-offset-[6px]">
                  Download PDF<span className="sr-only">: {d.name}</span>
                </a>
              </li>
            ))}
            {/* TODO(client): Q19 — reserved rows for what has not been supplied. */}
            {["ISO 9001:2015 certificate", "Operating licences"].map((name) => (
              <li key={name} data-todo="Q19" className="flex items-center gap-5 rounded-lg border border-dashed border-navy/20 p-6">
                {name.startsWith("ISO") ? (
                  <FileCheck2 className="size-10 shrink-0 text-navy/40" strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Hourglass className="size-10 shrink-0 text-navy/40" strokeWidth={1.5} aria-hidden="true" />
                )}
                <span className="flex-1 font-display text-lg font-medium text-navy">{name}</span>
                <span className="text-sm text-ink/70">To come</span>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <CtaBand title="Compliance is the part we take off your desk." />
    </main>
  );
}
