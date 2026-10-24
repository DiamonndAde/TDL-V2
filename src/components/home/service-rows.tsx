import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { wordpressCopy } from "@/content/facts";
import { services } from "@/content/services";
import { inSentence } from "@/lib/text";
import { serviceIcons } from "@/components/services/service-icons";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { SectionHeading } from "@/components/ui/section-heading";

/**
 * "TDL Core services" (audit §2.6–2.8): a charcoal band; each service is a large frame with a coal card overlapping
 * its inner edge, the side alternating. All seven lines (WordPress dropped Technology solutions), each card linking
 * to its page. Service copy is v1's (Q23); the band's sub-line is the WordPress one (Q33).
 */
export function ServiceRows() {
  return (
    <section aria-labelledby="services-title" className="on-dark bg-charcoal">
      <div className="container-site section-y">
        <header className="mx-auto max-w-3xl text-center">
          <SectionHeading id="services-title" before="TDL" accent="Core" after="services" onDark />
          <p className="mt-5 text-on-dark-muted">{wordpressCopy.servicesSub}</p>
        </header>

        <ul className="mt-14 space-y-16 lg:mt-20 lg:space-y-24">
          {services.map((s, i) => {
            const flip = i % 2 === 1;
            return (
              <li key={s.slug} className="grid items-center lg:grid-cols-12">
                <PhotoFrame
                  frame={`service:${s.slug}`}
                  icon={serviceIcons[s.slug]}
                  sizes="(min-width: 64rem) 820px, 100vw"
                  aspect="aspect-[3/2] lg:aspect-[16/9]"
                  focus={flip ? "right" : "left"}
                  className={`lg:col-span-8 lg:row-start-1 ${flip ? "lg:col-start-5" : "lg:col-start-1"}`}
                />
                <div
                  className={`relative bg-coal p-8 shadow-[0_20px_40px_rgb(0_0_0/0.25)] lg:row-start-1 lg:col-span-4 lg:my-12 lg:p-10 ${flip ? "lg:col-start-1 lg:-mr-10" : "lg:col-start-9 lg:-ml-10"}`}
                >
                  <h3 className="text-2xl text-white lg:text-[1.625rem]">{s.name}</h3>
                  <div aria-hidden="true" className={`mt-5 h-px w-2/3 bg-white/70 ${flip ? "lg:-ml-16" : "lg:-mr-16 lg:ml-auto"}`} />
                  <p className="mt-5 leading-[1.85] text-on-dark-muted">{s.lead}</p>
                  <Link
                    href={`/services/${s.slug}`}
                    className="mt-6 inline-flex items-center gap-2 font-bold text-accent-on-dark hover:underline"
                  >
                    Read about {inSentence(s.name)}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
