import { gardenQuote } from "@/content/facts";
import { Reveal } from "@/components/motion/reveal";

/**
 * The MD's garden quote (audit §2.5), verbatim (facts.ts). Mist panel, the lime "//" mark, the quote large and bold,
 * the attribution right-aligned. The name keeps the spelling on TDL's own site, "TOluwalase" (Q5); the WordPress
 * build's "Toluwalase" is not copied.
 */
export function QuotePanel() {
  return (
    <section aria-label="From our managing director" className="bg-white py-16 lg:py-24">
      <Reveal y={24} className="container-site">
        <figure className="rounded-lg bg-mist px-6 pt-8 pb-12 sm:px-10 lg:px-14 lg:pt-12 lg:pb-16">
          {/* The mark sits above and left of the quote, which is indented under it, as on WordPress. */}
          <span aria-hidden="true" className="block font-display text-7xl leading-none font-bold text-accent">
            {"//"}
          </span>
          <blockquote className="mt-2 text-[1.375rem] leading-snug font-bold text-navy sm:pl-8 sm:text-2xl lg:pl-12 lg:text-[1.8125rem] lg:leading-[1.3]">
            <p>{gardenQuote.text}</p>
          </blockquote>
          <figcaption className="mt-8 text-right text-[0.9375rem]">
            <span className="font-bold text-accent-strong">{gardenQuote.by}</span>
            <span className="text-navy">, {gardenQuote.role}</span>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
