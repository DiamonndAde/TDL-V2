import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The Why-TDL card (audit §2.11): white, a soft shadow, a Lucide icon in the accent, a Space Grotesk title and text.
 * With `href` the whole card is the link (the title's ::after covers it). `align` "left" suits lists of sub-services.
 */
export function FeatureCard({
  icon: Icon,
  title,
  children,
  href,
  align = "center",
  as: Heading = "h3",
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  href?: string;
  align?: "center" | "left";
  as?: "h2" | "h3";
}) {
  const center = align === "center";
  return (
    <div className={`relative h-full rounded-lg bg-white p-8 shadow-[0_15px_40px_rgb(15_23_42/0.08)] ${center ? "text-center" : ""}`}>
      <Icon className={`size-11 text-accent-strong ${center ? "mx-auto" : ""}`} strokeWidth={1.5} aria-hidden="true" />
      <Heading className="mt-5 font-display text-xl font-medium text-navy">
        {href ? (
          <Link href={href} className="after:absolute after:inset-0 hover:text-accent-strong">
            {title}
          </Link>
        ) : (
          title
        )}
      </Heading>
      {children ? <div className="mt-3 font-display text-[0.9375rem] leading-relaxed text-ink/80">{children}</div> : null}
    </div>
  );
}
