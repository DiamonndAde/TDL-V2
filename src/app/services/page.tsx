import type { Metadata } from "next";
import { CtaBand } from "@/components/layout/cta-band";
import { PageHeader } from "@/components/layout/page-header";
import { ServiceRowList } from "@/components/home/service-rows";
import { JsonLd } from "@/components/seo/json-ld";
import { wordpressCopy } from "@/content/facts";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Seven service lines from Total Data Limited: HR Outsourcing, Business Process Outsourcing, Recruitment and Background Checks, Learning and Development, Payroll Management, Business Advisory and Technology Solutions.",
  alternates: { canonical: "/services" },
};

/** The services index: the home page's seven rows, under a page header. Preserved URL. */
export default function ServicesIndex() {
  return (
    <main id="main">
      <JsonLd include={["services"]} />
      <PageHeader title="Seven things we take" accent="off your desk" lead={wordpressCopy.servicesSub} />
      <section aria-label="Our seven service lines" className="on-dark bg-charcoal">
        <div className="container-site section-y">
          <ServiceRowList as="h2" />
        </div>
      </section>
      <CtaBand title="Not sure which one you need?" lead="Tell us what is on your desk and how many people it involves. One of our representatives will contact you within 24 hours." />
    </main>
  );
}
