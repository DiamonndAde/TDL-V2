import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { framePhotographs } from "@/content/photographs";
import { stock, type StockFrame } from "@/content/placeholders";
import { isDemoBuild } from "@/lib/build-mode";

/**
 * A photograph frame. Source, in order: TDL's own photograph for this frame (photographs.ts, Q18/Q27); in a
 * presentation build only, the demo stock registered for it (placeholders.ts, no caption or credit on the page);
 * otherwise a designed brand panel: navy, the logo's lime arc, and an icon that says what the frame is about.
 * Never an empty box, never stock in a shipping build.
 *
 * The frame reserves its aspect ratio either way, so swapping photograph for panel never shifts layout.
 */
export function PhotoFrame({
  frame,
  icon: Icon,
  aspect = "aspect-[3/2]",
  sizes,
  focus = "center",
  className = "",
  children,
}: {
  frame: StockFrame;
  icon: LucideIcon;
  /** Tailwind aspect class(es) for the frame. */
  aspect?: string;
  sizes: string;
  /** Where the brand panel's icon sits from lg up: away from a card that overlaps one side of the frame. */
  focus?: "center" | "left" | "right";
  className?: string;
  /** Overlaid content, e.g. a badge or a button. */
  children?: React.ReactNode;
}) {
  const own = framePhotographs[frame];
  const demo = !own && isDemoBuild ? stock[frame] : undefined;
  const photo = own
    ? { src: own.src, width: own.width, height: own.height, alt: own.alt, position: own.position }
    : demo
      ? { src: demo.file, width: demo.width, height: demo.height, alt: "", position: demo.position }
      : null;

  return (
    <div className={`relative overflow-hidden ${aspect} ${className}`} data-demo={demo ? frame : undefined}>
      {photo ? (
        <Image
          src={photo.src}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          sizes={sizes}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: photo.position ?? "50% 50%" }}
        />
      ) : (
        <BrandPanel icon={Icon} focus={focus} />
      )}
      {children}
    </div>
  );
}

/** Navy with the logo's lime arc and a lime icon: reads as designed, never as a missing photograph. */
function BrandPanel({ icon: Icon, focus }: { icon: LucideIcon; focus: "center" | "left" | "right" }) {
  const place = focus === "left" ? "lg:pr-[22%]" : focus === "right" ? "lg:pl-[22%]" : "";
  return (
    <div aria-hidden="true" className={`absolute inset-0 grid place-items-center overflow-hidden bg-navy ${place}`}>
      <div className="absolute -right-[18%] -bottom-[30%] aspect-square w-[70%] rounded-full border-[1.75rem] border-accent/25 lg:border-[2.5rem]" />
      <div className="absolute -top-[25%] -left-[12%] aspect-square w-[38%] rounded-full border-[0.75rem] border-white/5" />
      <Icon className="relative size-20 text-accent-on-dark lg:size-28" strokeWidth={1.25} />
    </div>
  );
}
