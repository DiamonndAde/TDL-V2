import { ShieldCheck, Target, UserCheck } from "lucide-react";
import { figures, wordpressCopy } from "@/content/facts";
import { Reveal } from "@/components/motion/reveal";
import { TypedWords } from "@/components/motion/typed-words";
import { FeatureCard } from "@/components/ui/feature-card";
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
          <PhotoFrame frame="why" icon={UserCheck} aspect="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[5/7]" sizes="(min-width: 64rem) 480px, 100vw" imageClassName="sm:max-lg:[object-position:50%_25%]" className="rounded-lg">
            {/* Bottom-left on phones and from lg (the frame is portrait there and the corner holds the table). From sm to
                lg the frame turns 4:3 and the bottom-left corner covered the people's hands, so the badge moves to the
                top-left and the crop moves up the portrait so both heads sit below it. */}
            <div className="absolute bottom-0 left-0 rounded-tr-lg bg-white p-2 pb-0 pl-0 sm:top-0 sm:bottom-auto sm:rounded-tr-none sm:rounded-br-lg sm:pt-0 sm:pb-2 lg:top-auto lg:bottom-0 lg:rounded-tr-lg lg:rounded-br-none lg:pt-2 lg:pb-0">
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
            {wordpressCopy.why.map((c, i) => (
              <li key={c.title}>
                <FeatureCard icon={icons[i]} title={c.title} href={c.href}>
                  {c.text}
                </FeatureCard>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
