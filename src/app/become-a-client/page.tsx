import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { PageHeader } from "@/components/layout/page-header";
import { company, process } from "@/content/facts";

export const metadata: Metadata = {
  title: "Become a client",
  description:
    "Tell Total Data Limited which services you need and how many people are involved. Three short steps; a representative contacts you within 24 hours.",
  alternates: { canonical: "/become-a-client" },
};

/**
 * The enquiry page (preserved URL; /new-client redirects here). `?service=<slug>` from a service page pre-selects
 * that service in step 1; the form reads it after mount, so the route stays static and the form is in the HTML.
 */
export default function BecomeAClientPage() {
  return (
    <main id="main">
      <PageHeader
        eyebrow="Become a client"
        title="Three short steps."
        accent="Then we call."
        lead={
          <>
            Which services, how many people, and who to talk to. {process.responsePromise} Prefer to talk now? Call{" "}
            <a href={company.phoneHref} className="font-bold text-accent-strong underline underline-offset-4">
              {company.phone}
            </a>
            .
          </>
        }
      />
      <section aria-label="Enquiry form" className="bg-white">
        <div className="container-site py-14 lg:py-20">
          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-[0_15px_40px_rgb(15_23_42/0.08)] sm:p-10">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </main>
  );
}
