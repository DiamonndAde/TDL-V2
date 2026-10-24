"use client";

import { inView } from "motion";
import { useAnimate } from "motion/react-mini";
import { useEffect, type ReactNode } from "react";

/** True when the visitor has not asked for reduced motion. Client only. */
export function motionAllowed() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Below the fold right now, so arming it (hiding it until it scrolls in) can't hide anything already seen. */
export function belowFold(el: Element) {
  return el.getBoundingClientRect().top > window.innerHeight;
}

/**
 * A section entrance, once, when it scrolls into view (AGENTS.md, Motion): opacity plus a small offset, 0.5 s,
 * ease-out. Built on motion's `inView` and `useAnimate` (the WAAPI-only mini build) rather than `whileInView`,
 * because `whileInView` renders its starting state on the server, which would ship the content at opacity 0, the
 * WordPress fault (audit §5). Here the server HTML is always visible and the hidden state is applied after
 * hydration, only when motion is allowed and only to content below the fold.
 *
 * `items`: a selector for children that enter one after another (stagger ≤ 0.08 s) instead of the wrapper.
 */
export function Reveal({
  children,
  y = 16,
  x = 0,
  delay = 0,
  items,
  stagger = 0.08,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  y?: number;
  x?: number;
  delay?: number;
  items?: string;
  stagger?: number;
  className?: string;
  as?: "div" | "li" | "ul" | "figure";
}) {
  const [scope, animate] = useAnimate<HTMLElement>();

  useEffect(() => {
    const root = scope.current;
    if (!root || !motionAllowed() || !belowFold(root)) return;
    const targets: HTMLElement[] = items ? Array.from(root.querySelectorAll<HTMLElement>(items)) : [root];
    if (!targets.length) return;
    const from = { opacity: 0, transform: `translate(${x}px, ${y}px)` };
    for (const t of targets) animate(t, from, { duration: 0 });
    const stop = inView(
      root,
      () => {
        targets.forEach((t, i) =>
          animate(t, { opacity: 1, transform: "translate(0px, 0px)" }, { duration: 0.5, ease: "easeOut", delay: delay + i * stagger }),
        );
      },
      { margin: "0px 0px -12% 0px" },
    );
    return stop;
  }, [scope, animate, items, x, y, delay, stagger]);

  return (
    <Tag ref={scope as never} data-reveal="" className={className}>
      {children}
    </Tag>
  );
}
