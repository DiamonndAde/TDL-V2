import { Handshake } from "lucide-react";
import { wordpressCopy } from "@/content/facts";
import { ButtonPill } from "@/components/ui/button-pill";
import { Reveal } from "@/components/motion/reveal";
import { TypedWords } from "@/components/motion/typed-words";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { SectionHeading } from "@/components/ui/section-heading";

/**
 * "About TDL" (audit §2.4): text on the left, a full-height photograph on the right with the button over its corner.
 * The WordPress "Learn More" went to "#"; this one goes to /about-us. Copy from the WordPress build (Q33).
 *
 * The photograph runs to the viewport's right edge on the `.bleed-grid` named lines (mid → full-end), not on vw
 * units. `overflow-x-clip` is a safety net only: clip, not hidden, so it creates no scroll container and the sticky
 * header keeps working.
 */
export function AboutBlock() {
  return (
    <section aria-labelledby="about-title" className="overflow-x-clip bg-white">
      {/* Not .container-site: its max-width and padding would win over the lg overrides; the bleed grid needs the full width. */}
      <div className="bleed-grid mx-auto grid w-full max-w-(--container-site) items-center gap-10 px-5 py-16 sm:px-8 lg:max-w-none lg:gap-0 lg:px-0 lg:py-0">
        <Reveal className="lg:col-[content-start/mid] lg:mr-8 lg:border-l-2 lg:border-accent/60 lg:py-24 lg:pl-12">
          <SectionHeading id="about-title" before="About" accent={<TypedWords text="TDL" />} />
          <p className="mt-6 max-w-[30rem] text-[1.0625rem]">{wordpressCopy.about}</p>
        </Reveal>
        <Reveal y={0} className="-mx-5 sm:-mx-8 lg:col-[mid/full-end] lg:mx-0 lg:ml-8 lg:h-full">
          <PhotoFrame
            frame="about"
            icon={Handshake}
            aspect="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[36rem]"
            sizes="(min-width: 64rem) 50vw, 100vw"
          >
            <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10">
              <ButtonPill href="/about-us" size="md">
                Learn more
              </ButtonPill>
            </div>
          </PhotoFrame>
        </Reveal>
      </div>
    </section>
  );
}
