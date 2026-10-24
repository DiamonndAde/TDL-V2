"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { motionAllowed } from "./reveal";

/**
 * Testimonials (change 9): three cards in one row from `lg`; below that, the WordPress carousel, one card at a
 * time. The carousel is a native scroll-snap track, so swipe works without script (WordPress disabled swipe);
 * script adds prev/next, "1 / 3", and an auto-advance every 6 s that only runs below `lg`, while on screen, when
 * nothing holds it (Pause, hover, focus inside) and never under reduced motion, where the Pause control is gone.
 */
export function TestimonialTrack({ children, label }: { children: ReactNode; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const items = Children.toArray(children);
  const n = items.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [active, setActive] = useState(false); // narrow screen, on screen, motion allowed

  const go = (i: number) => {
    const el = track.current;
    const card = el?.children[(i + n) % n] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: motionAllowed() ? "smooth" : "auto" });
  };

  // Which card is showing, from the scroll position (works for swipes as well as buttons).
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(Array.prototype.indexOf.call(el.children, e.target));
      },
      { root: el, threshold: 0.6 },
    );
    Array.from(el.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [n]);

  // Whether auto-advance may run at all.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const narrow = window.matchMedia("(max-width: 63.999rem)");
    let onScreen = false;
    const update = () => setActive(narrow.matches && onScreen && motionAllowed() && document.visibilityState === "visible");
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      update();
    });
    io.observe(el);
    narrow.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      narrow.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (!active || paused || held) return;
    const t = window.setTimeout(() => go(current + 1), 6000);
    return () => window.clearTimeout(t);
  });

  return (
    <div
      onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHeld(false)}
    >
      <ul
        ref={track}
        aria-label={label}
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 [scrollbar-width:none] motion-reduce:scroll-auto sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((child, i) => (
          <li key={i} data-card="" className="w-[85%] shrink-0 snap-center sm:w-[60%] lg:w-auto">
            {child}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-center gap-3 lg:hidden">
        <button type="button" onClick={() => go(current - 1)} aria-label="Previous testimonial" className="grid size-11 place-items-center rounded-full bg-white text-navy shadow-sm">
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <p className="min-w-14 text-center font-display text-sm text-navy" aria-live="polite">
          {current + 1} / {n}
        </p>
        <button type="button" onClick={() => go(current + 1)} aria-label="Next testimonial" className="grid size-11 place-items-center rounded-full bg-white text-navy shadow-sm">
          <ChevronRight size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play testimonials" : "Pause testimonials"}
          className="ml-2 grid size-11 place-items-center rounded-full bg-navy text-white motion-reduce:hidden"
        >
          {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
