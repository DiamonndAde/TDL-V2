import Link from "next/link";
import type { ReactNode } from "react";
import { company, process } from "@/content/facts";
import type { ServiceSlug } from "@/content/services";
import { PartnerCta } from "@/components/ui/partner-cta";

/**
 * The close at the foot of an inner page: a charcoal band (the services band's ground) with one heading, the response
 * promise (facts.ts, Q12), "Partner with us" on WhatsApp, and the two quieter routes: the enquiry form and the phone.
 * On a service page both the WhatsApp message and the form carry the service.
 */
export function CtaBand({
  title,
  lead,
  service,
}: {
  title: ReactNode;
  lead?: ReactNode;
  service?: { slug: ServiceSlug; name: string };
}) {
  const formHref = service ? `/become-a-client?service=${service.slug}` : "/become-a-client";
  return (
    <section aria-labelledby="cta-title" className="on-dark bg-charcoal">
      <div className="container-site py-16 lg:py-20">
        <h2 id="cta-title" className="max-w-[22ch] text-[2rem] leading-tight text-white lg:text-[2.5rem]">
          {title}
        </h2>
        <p className="mt-5 max-w-[38rem] text-on-dark-muted">{lead ?? process.responsePromise}</p>
        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
          <PartnerCta location={service ? "service_close" : "close"} service={service} />
          <Link href={formHref} className="font-bold text-white underline decoration-accent-on-dark decoration-2 underline-offset-[6px] hover:text-accent-on-dark">
            Prefer a form? Become a client
          </Link>
          <a href={company.phoneHref} className="font-bold text-white underline decoration-white/40 decoration-2 underline-offset-[6px] hover:decoration-white">
            Call {company.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
