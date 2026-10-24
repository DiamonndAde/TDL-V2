"use client";

import { Pause, Play } from "lucide-react";
import { useState } from "react";

/**
 * The logo marquee's Pause control (WCAG 2.2.2). The animation itself is CSS (`.marquee` in globals.css); this only
 * flips `data-paused` on the marquee. Hidden under reduced motion, where nothing moves.
 */
export function MarqueePause() {
  const [paused, setPaused] = useState(false);
  return (
    <button
      type="button"
      aria-label={paused ? "Play logo scroll" : "Pause logo scroll"}
      onClick={(e) => {
        const next = !paused;
        setPaused(next);
        e.currentTarget.closest(".marquee")?.setAttribute("data-paused", String(next));
      }}
      className="grid size-11 place-items-center rounded-full border border-navy/15 text-navy transition-colors hover:bg-mist motion-reduce:hidden"
    >
      {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
    </button>
  );
}
