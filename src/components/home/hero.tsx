import { headline } from "@/content/facts";
import { heroPhotographs } from "@/content/photographs";
import { sliderImages } from "@/content/placeholders";
import { HeroSlider, type Slide } from "@/components/motion/hero-slider";
import { TypedHeadline } from "@/components/motion/typed-headline";
import { PartnerCta } from "@/components/ui/partner-cta";
import { isDemoBuild } from "@/lib/build-mode";

/**
 * The WordPress hero (audit §2.2), with TDL's changes 6 and 8: the new headline as the page's H1, and the home
 * images as a background slider. Image source, in order: TDL's own photographs (Q27); in a presentation build only,
 * the six client-approved generated images (no caption, PLACEHOLDERS.md); otherwise a plain navy hero (D4).
 */
export function Hero() {
  const own = heroPhotographs.map<Slide>((p) => ({ ...p, position: p.position ?? "50% 50%" }));
  const demo = own.length === 0 && isDemoBuild;
  const slides: Slide[] = own.length
    ? own
    : demo
      ? sliderImages.map((g) => ({
          src: g.file,
          width: g.width,
          height: g.height,
          alt: "",
          position: g.position,
          phone: g.phone ? { src: g.phone.file, width: g.phone.width, height: g.phone.height } : undefined,
        }))
      : [];

  // headline.default is "We run the HR. You run the business." (Q23): the first sentence stays, the second types.
  const [lead, ...rest] = headline.default.split(/(?<=\.)\s+/);
  const typed = rest.join(" ");

  return (
    <section aria-labelledby="hero-title" className="on-dark relative isolate overflow-hidden bg-navy">
      {slides.length ? <HeroSlider slides={slides} demo={demo} /> : null}
      <div className="container-site pointer-events-none relative flex min-h-[36rem] items-center pt-14 pb-28 lg:min-h-[min(46rem,calc(100svh-var(--header-h)))] lg:pt-16 lg:pb-32">
        <div className="pointer-events-auto max-w-[38rem]">
          <TypedHeadline id="hero-title" lead={lead} typed={typed} />
          {/* No entrance on the sub-line: without photographs it is the LCP element, and a fade from opacity 0
              delays LCP by its whole duration (measured 2026-10-24). */}
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed font-bold text-white">
            {headline.sub}
          </p>
          <div className="hero-rise mt-9 [--d:150ms]">
            <PartnerCta location="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}
