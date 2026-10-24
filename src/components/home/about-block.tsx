import { Handshake } from "lucide-react";
import { wordpressCopy } from "@/content/facts";
import { ButtonPill } from "@/components/ui/button-pill";
import { PhotoFrame } from "@/components/ui/photo-frame";
import { SectionHeading } from "@/components/ui/section-heading";

/**
 * "About TDL" (audit §2.4): text on the left, a full-height photograph on the right with the button over its corner.
 * The WordPress "Learn More" went to "#"; this one goes to /about-us. Copy from the WordPress build (Q33).
 */
export function AboutBlock() {
  return (
    <section aria-labelledby="about-title" className="bg-white">
      <div className="container-site grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-0">
        <div className="lg:border-l-2 lg:border-accent/60 lg:py-24 lg:pl-12">
          <SectionHeading id="about-title" before="About" accent="TDL" />
          <p className="mt-6 max-w-[30rem] text-[1.0625rem]">{wordpressCopy.about}</p>
        </div>
        <PhotoFrame
          frame="about"
          icon={Handshake}
          aspect="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[36rem]"
          sizes="(min-width: 64rem) 600px, 100vw"
          className="-mx-5 sm:-mx-8 lg:mx-0 lg:-mr-8 xl:-mr-[calc((100vw-75rem)/2+2rem)]"
        >
          <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10">
            <ButtonPill href="/about-us" size="md">
              Learn more
            </ButtonPill>
          </div>
        </PhotoFrame>
      </div>
    </section>
  );
}
