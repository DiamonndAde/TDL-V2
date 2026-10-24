import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The WordPress button (audit §2.2): a pill label plus a separate round arrow. On hover the arrow moves from the
 * right of the label to the left in 0.3 s, as Animation Addons' "style 6" did. Under reduced motion it swaps
 * without the transition. The arrows are decorative; the accessible name is the label (or `ariaLabel`).
 *
 * `tone`: "accent" is the green fill on any ground; "light" is white with navy text, for dark grounds where a
 * second, quieter action sits beside the accent one.
 */
export function ButtonPill({
  href,
  children,
  ariaLabel,
  external = false,
  tone = "accent",
  size = "md",
  className = "",
  onClick,
}: {
  href: string;
  children: ReactNode;
  ariaLabel?: string;
  external?: boolean;
  tone?: "accent" | "light";
  size?: "md" | "lg";
  className?: string;
  /** Only from a client component (an analytics click, for instance). */
  onClick?: () => void;
}) {
  const fill =
    tone === "accent"
      ? "bg-accent-strong text-white group-hover:bg-accent-strong-hover"
      : "bg-white text-navy group-hover:bg-mist";
  // --pill is the arrow circle's diameter; Tailwind cannot see interpolated class names, so widths read it.
  const pill = size === "lg" ? "[--pill:3.5rem] lg:[--pill:3.75rem]" : "[--pill:3rem]";
  const h = "h-(--pill)";
  const arrow = `${fill} ${h} grid shrink-0 place-items-center overflow-hidden rounded-full transition-[width,margin,opacity,scale,background-color] duration-300 ease-out motion-reduce:transition-none`;

  const inner = (
    <>
      {/* Left arrow: collapsed until hover. */}
      <span aria-hidden="true" className={`${arrow} -mr-1 w-0 scale-50 opacity-0 group-hover:mr-0 group-hover:w-(--pill) group-hover:scale-100 group-hover:opacity-100 group-focus-visible:mr-0 group-focus-visible:w-(--pill) group-focus-visible:scale-100 group-focus-visible:opacity-100`}>
        <ArrowRight size={20} strokeWidth={2.25} />
      </span>
      <span className={`${fill} ${h} inline-flex items-center gap-2.5 rounded-full px-7 text-base font-bold leading-none transition-colors duration-300 motion-reduce:transition-none lg:px-9`}>
        {children}
      </span>
      {/* Right arrow: shown until hover. */}
      <span aria-hidden="true" className={`${arrow} w-(--pill) scale-100 opacity-100 group-hover:-ml-1 group-hover:w-0 group-hover:scale-50 group-hover:opacity-0 group-focus-visible:-ml-1 group-focus-visible:w-0 group-focus-visible:scale-50 group-focus-visible:opacity-0`}>
        <ArrowRight size={20} strokeWidth={2.25} />
      </span>
    </>
  );

  const cls = `group inline-flex items-center rounded-full ${pill} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} onClick={onClick} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} aria-label={ariaLabel} onClick={onClick} className={cls}>
      {inner}
    </Link>
  );
}
