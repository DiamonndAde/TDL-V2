"use client";

import { inView } from "motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { belowFold, motionAllowed } from "./reveal";

/**
 * A heading's accent word typed once when the heading scrolls into view, as WordPress typed "TDL", "Core",
 * "Global Brands" and "Total Data", but in view rather than at page load off-screen (audit §5).
 *
 * The server HTML shows the word whole. After hydration, if motion is allowed and the heading is below the fold,
 * the characters are hidden ("armed"); on entering view they type in with the hero's CSS (`.typed-words` in
 * globals.css: the end state is the base style). A visually hidden copy carries the word for assistive technology.
 */
export function TypedWords({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<"static" | "armed" | "run">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed() || !belowFold(el)) return;
    setPhase("armed");
    return inView(el, () => setPhase("run"), { margin: "0px 0px -15% 0px" });
  }, []);

  const chars = [...text];
  return (
    <span ref={ref} className="relative">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={`typed-words ${phase === "armed" ? "is-armed" : phase === "run" ? "is-running" : ""}`}>
        {chars.map((c, i) => (
          <span key={i} className={i === chars.length - 1 ? "tc tc-last" : "tc"} style={{ "--i": i } as CSSProperties}>
            {c}
          </span>
        ))}
      </span>
    </span>
  );
}
