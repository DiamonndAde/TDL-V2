import { BadgeCheck, Building2, CalendarClock, Users, type LucideIcon } from "lucide-react";
import { figures } from "@/content/facts";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";

/**
 * The WordPress figures strip (audit §2.3), corrected: "since 2000" instead of "10+ years" (Q2), 5,000+ managed staff
 * instead of 4,000+ (Q1), 100+ clients (Q6), ISO 9001:2015. Lucide icons in the accent, not Gemini PNGs. The number is
 * the item's emphasis, so it leads; Space Grotesk for figures, as WordPress used it for its counter.
 */
const items: { icon: LucideIcon; figure: React.ReactNode; label: string }[] = [
  { icon: BadgeCheck, figure: figures.certified.display, label: figures.certified.label },
  { icon: CalendarClock, figure: figures.operating.display, label: figures.operating.label },
  // The two counts count up once in view (when they start below the fold); ISO and "since 2000" are not counts.
  { icon: Building2, figure: <CountUp value={figures.clients.value} display={figures.clients.display} />, label: figures.clients.label },
  { icon: Users, figure: <CountUp value={figures.staff.value} display={figures.staff.display} />, label: figures.staff.label },
];

export function FiguresStrip() {
  return (
    <section aria-label="Total Data Limited in figures" className="border-b border-black/5 bg-white">
      <Reveal as="ul" items=":scope > li" className="container-site grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-4 lg:py-14">
        {items.map(({ icon: Icon, figure, label }) => (
          <li key={label} className="flex flex-col items-center text-center">
            <Icon className="size-12 text-accent-strong lg:size-14" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-4 font-display text-2xl font-bold text-navy lg:text-[1.75rem]">{figure}</p>
            <p className="mt-1 text-[0.9375rem] text-ink/75">{label}</p>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
