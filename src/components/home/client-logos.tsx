import Image from "next/image";
import { clientLogos, logoDisplayHeight } from "@/content/clients";
import { TypedWords } from "@/components/motion/typed-words";
import { SectionHeading } from "@/components/ui/section-heading";
import { MarqueePause } from "@/components/motion/marquee-pause";

/**
 * "Trusted by global brands and market leaders" (audit §2.10). WordPress showed ten logos, five of them twice, in a
 * static grid; v2 shows the fifteen client logos from v1 (Q24 permission, Q17 sharper files) as a marquee (D3):
 * pure CSS, ~45 s a loop, paused while hovered or focused and by its Pause control, and a static wrapped row under
 * reduced motion. The second copy of the row exists only to make the loop seamless and is hidden from assistive
 * technology.
 */
export function ClientLogos() {
  const row = (copy: boolean) => (
    <ul aria-hidden={copy || undefined} className={`marquee-row flex shrink-0 items-center gap-14 pr-14 lg:gap-20 lg:pr-20 ${copy ? "marquee-copy" : ""}`}>
      {clientLogos.map((l) => {
        const h = logoDisplayHeight(l);
        return (
          <li key={l.file} className="shrink-0">
            <Image
              src={`/clients/trimmed/${l.file}`}
              width={l.width}
              height={l.height}
              alt={copy ? "" : l.name}
              style={{ height: h, width: Math.round((h * l.width) / l.height) }}
              sizes={`${Math.round((h * l.width) / l.height)}px`}
            />
          </li>
        );
      })}
    </ul>
  );

  return (
    <section aria-labelledby="clients-title" className="bg-white py-14 lg:py-20">
      <div className="container-site text-center">
        <SectionHeading id="clients-title" before="Trusted by" accent={<TypedWords text="global brands" />} after="and market leaders" />
      </div>
      <div className="marquee relative mt-12 lg:mt-16">
        <div className="marquee-viewport overflow-hidden">
          <div className="marquee-track flex w-max">
            {row(false)}
            {row(true)}
          </div>
        </div>
        <div className="container-site mt-8 flex justify-end">
          <MarqueePause />
        </div>
      </div>
    </section>
  );
}
