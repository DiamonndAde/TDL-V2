import Link from "next/link";
import { ShieldCheck, Target, UserCheck } from "lucide-react";
import { figures, wordpressCopy } from "@/content/facts";
import { Reveal } from "@/components/motion/reveal";
import { TypedWords } from "@/components/motion/typed-words";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { SectionHeading } from "@/components/ui/section-heading";

const icons = [Target, ShieldCheck];

/**
 * "Why Total Data Limited?" (audit §2.11): a portrait photograph with a badge over its corner, and two cards. The
 * WordPress badge counted to "10 +" years; v2 says "since 2000" and does not count (Q2). The badge is lime with navy
 * text (9.75:1), replacing WordPress's yellow. Card links go to /services and /certifications, not the theme vendor's
 * demo site, and "Ncompromised" is spelled right. Card copy from the WordPress build (Q33).
 */
export function WhyTdl() {
  return (
    <section aria-labelledby="why-title" className="bg-white">
      <div className="container-site grid items-center gap-12 py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-28">
        <Reveal y={0}>
          <PhotoFrame frame="why" icon={UserCheck} aspect="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[5/7]" sizes="(min-width: 64rem) 480px, 100vw" className="rounded-lg">
            <div className="absolute bottom-0 left-0 rounded-tr-lg bg-white p-2 pb-0 pl-0">
              <div className="rounded-md bg-accent px-6 py-4 text-navy lg:px-8 lg:py-5">
                <p className="font-display text-3xl font-bold lg:text-[2.5rem]">{figures.operating.display}</p>
                <p className="font-display text-base font-medium lg:text-lg">{figures.operating.label}</p>
              </div>
            </div>
          </PhotoFrame>
        </Reveal>
        <div>
          <SectionHeading id="why-title" before="Why" accent={<TypedWords text="Total Data" />} after="Limited?" />
          <Reveal as="ul" items=":scope > li" className="mt-10 grid gap-6 sm:grid-cols-2">
            {wordpressCopy.why.map((c, i) => {
              const Icon = icons[i];
              return (
                <li key={c.title} className="relative rounded-lg bg-white p-8 text-center shadow-[0_15px_40px_rgb(15_23_42/0.08)]">
                  <Icon className="mx-auto size-11 text-accent-strong" strokeWidth={1.5} aria-hidden="true" />
                  <h3 className="mt-5 font-display text-xl font-medium text-navy">
                    <Link href={c.href} className="after:absolute after:inset-0 hover:text-accent-strong">
                      {c.title}
                    </Link>
                  </h3>
                  <p className="mt-3 font-display text-[0.9375rem] leading-relaxed text-ink/80">{c.text}</p>
                </li>
              );
            })}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
