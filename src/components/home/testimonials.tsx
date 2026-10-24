import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { testimonials } from "@/content/testimonials";
import { Reveal } from "@/components/motion/reveal";
import { TestimonialTrack } from "@/components/motion/testimonial-track";

/**
 * Testimonials (audit §2.9; change 9). The WordPress panel (a gradient, here lime-tint to cloud) and its outlined
 * "Testimonial" word, which stays but no longer scrolls (D3). Each card shows ONE verbatim sentence of the client's
 * quote (`excerpt`, checked verbatim by the boundary check) and links to the whole quote on /work. None of the
 * chosen sentences carries the original's typos (Q22).
 */
export function Testimonials() {
  return (
    <section aria-labelledby="testimonials-title" className="bg-white py-12 lg:py-20">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-accent-tint to-cloud px-5 pt-6 pb-12 sm:px-8 lg:px-12 lg:pb-16">
          <p
            aria-hidden="true"
            className="pointer-events-none -mx-5 font-display text-[5.5rem] leading-none font-bold whitespace-nowrap text-transparent [-webkit-text-stroke:1.5px_rgb(15_23_42/0.16)] select-none sm:text-[9rem] lg:-mx-12 lg:text-[13rem]"
          >
            Testimonials Testimonials
          </p>
          <h2 id="testimonials-title" className="sr-only">
            What our clients say
          </h2>
          <Reveal items="[data-card]" className="relative -mt-6 sm:-mt-12 lg:-mt-20">
            <TestimonialTrack label="Client testimonials">
              {testimonials.map((t) => (
                <figure key={t.id} className="flex h-full flex-col rounded-3xl bg-white p-7 shadow-[0_10px_30px_rgb(15_23_42/0.06)] lg:p-8">
                  <Image src={t.logo.src} width={t.logo.width} height={t.logo.height} alt={t.logo.alt} className="h-12 w-auto self-start object-contain" />
                  <blockquote className="mt-6 flex-1 font-display text-lg leading-relaxed text-quote lg:text-[1.1875rem]">
                    <p>“{t.excerpt}”</p>
                  </blockquote>
                  <figcaption className="mt-6">
                    <p className="font-display text-lg font-medium text-navy">{t.person}</p>
                    <p className="mt-0.5 text-sm text-ink/70">
                      {t.role}, {t.company}
                    </p>
                    <Link href={`/work#${t.id}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-accent-strong hover:underline">
                      Read the full quote
                      <span className="sr-only"> from {t.person}</span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </figcaption>
                </figure>
              ))}
            </TestimonialTrack>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
