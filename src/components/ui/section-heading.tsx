import type { ReactNode } from "react";

/**
 * The WordPress section heading (audit §2.4–2.11): Lato 700 at ~43 px with one accent phrase. The accent is
 * `accent-strong` on light grounds (5.4:1) and lime on dark ones; lime on white would be 1.8:1 (D1).
 * `accent` is a node so the typed version (step 6) can drop in without changing callers.
 */
export function SectionHeading({
  before,
  accent,
  after,
  onDark = false,
  id,
  className = "",
}: {
  before?: string;
  accent: ReactNode;
  after?: string;
  onDark?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={`text-[2rem] leading-tight sm:text-[2.375rem] lg:text-[2.6875rem] ${onDark ? "text-white" : "text-navy"} ${className}`}
    >
      {before ? <>{before} </> : null}
      <span className={onDark ? "text-accent-on-dark" : "text-accent-strong"}>{accent}</span>
      {after ? <> {after}</> : null}
    </h2>
  );
}
