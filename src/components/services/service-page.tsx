import Link from "next/link";
import { CircleCheckBig } from "lucide-react";
import { services, type Service } from "@/content/services";
import { inSentence } from "@/lib/text";
import { CtaBand } from "@/components/layout/cta-band";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { FeatureCard } from "@/components/ui/feature-card";
import { PartnerCta } from "@/components/ui/partner-cta";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { SectionHeading } from "@/components/ui/section-heading";
import { serviceIcons } from "./service-icons";

/**
 * One template for the seven service pages, in the home page's parts. The H1 is what the service takes off the
 * buyer's desk (`removes`), under the service's name; the frame beside it is the same one as the service's home row.
 * Sub-services are Why-TDL cards; the close is scoped to the service (the WhatsApp message and the form both carry
 * it); the other six follow as linked cards. Copy is v1's (Q23).
 */
export function ServicePage({ service }: { service: Service }) {
  const others = services.filter((s) => s.slug !== service.slug);
  const scoped = { slug: service.slug, name: service.name };
  return (
    <main id="main">
      <PageHeader
        eyebrow={service.name}
        title={service.removes}
        lead={service.lead}
        actions={
          <>
            <PartnerCta service={scoped} />
            <Link href={`/become-a-client?service=${service.slug}`} className="font-bold text-accent-strong underline decoration-2 underline-offset-[6px]">
              Prefer a form?
            </Link>
          </>
        }
        aside={
          <PhotoFrame
            frame={`service:${service.slug}`}
            icon={serviceIcons[service.slug]}
            aspect="aspect-[4/3]"
            sizes="(min-width: 64rem) 448px, 100vw"
            className="rounded-lg"
          />
        }
      />

      <section aria-labelledby="what-we-run" className="bg-white">
        <div className="container-site section-y">
          <SectionHeading id="what-we-run" before="What we" accent="run" />
          <Reveal as="ul" items=":scope > li" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {service.lines.map((l) => (
              <li key={l.name}>
                <FeatureCard icon={CircleCheckBig} title={l.name} align="left">
                  {l.does}
                </FeatureCard>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <CtaBand title={`Hand us ${inSentence(service.name)}.`} service={scoped} />

      <section aria-labelledby="other-services" className="bg-white">
        <div className="container-site section-y">
          <SectionHeading id="other-services" before="The other" accent="six" />
          <Reveal as="ul" items=":scope > li" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <li key={s.slug}>
                <FeatureCard icon={serviceIcons[s.slug]} title={s.name} href={`/services/${s.slug}`} align="left">
                  {s.removes}
                </FeatureCard>
              </li>
            ))}
          </Reveal>
        </div>
      </section>
    </main>
  );
}
