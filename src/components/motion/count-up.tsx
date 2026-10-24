"use client";

import { inView } from "motion";
import { useEffect, useRef, useState } from "react";
import { belowFold, motionAllowed } from "./reveal";

/**
 * A figure that counts up once when it scrolls into view (WordPress counted its badge at page load). The server
 * HTML shows the final figure; the count runs only when motion is allowed and the figure starts below the fold, so
 * a figure already on screen never changes under the reader. Assistive technology reads the final figure only.
 */
export function CountUp({ value, display, duration = 900 }: { value: number; display: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(display);
  const suffix = display.replace(/[\d,]/g, "");

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed() || !belowFold(el)) return;
    const fmt = (n: number) => `${Math.round(n).toLocaleString("en-NG")}${suffix}`;
    setShown(fmt(0));
    let raf = 0;
    const stop = inView(el, () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setShown(t < 1 ? fmt(value * eased) : display);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    return () => {
      stop();
      cancelAnimationFrame(raf);
    };
  }, [value, display, suffix, duration]);

  return (
    <span ref={ref}>
      <span className="sr-only">{display}</span>
      <span aria-hidden="true" className="tabular-nums">
        {shown}
      </span>
    </span>
  );
}
