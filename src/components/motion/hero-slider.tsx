"use client";

import { getImageProps } from "next/image";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

export interface Slide {
  src: string;
  width: number;
  height: number;
  /** Empty for decorative demo images; TDL's own photographs say who and where. */
  alt: string;
  position: string;
  phone?: { src: string; width: number; height: number; position?: string };
}

/**
 * The hero's background slider (change 8; D4). The images crossfade over 0.8 s, 6 s each. Bounds, as in v1's
 * client-approved slider:
 *  - it starts only after first paint, and runs only while the hero is on screen and the tab is visible;
 *  - it pauses while the pointer is over the hero or focus is inside it, and the visible Pause control holds it;
 *  - under prefers-reduced-motion nothing advances on its own and the Pause control is gone; the indicators
 *    still change the image, instantly.
 *
 * The 6 s clock IS the current indicator's fill animation: the slider advances on its `animationend`. Pausing is
 * `animation-play-state: paused`, so a resume continues where it stopped, and under reduced motion (no
 * animation) it never advances by itself.
 *
 * Images load as needed: the first eagerly at high fetch priority (the LCP candidate), each later one when the
 * one before it is showing.
 */
export function HeroSlider({ slides, demo }: { slides: Slide[]; demo: boolean }) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(1);
  const [userPaused, setUserPaused] = useState(false);
  // Pressing Play is an explicit request to run, so it overrides the hover/focus hold (the pointer and focus are on
  // the Play button at that moment). Pause or manual navigation ends the override.
  const [override, setOverride] = useState(false);
  const [held, setHeld] = useState(false); // hover or focus inside the hero
  const [visible, setVisible] = useState(true); // on screen and tab visible
  const root = useRef<HTMLDivElement>(null);
  const n = slides.length;

  const show = (i: number) => {
    const next = (i + n) % n;
    setOverride(false);
    setCurrent(next);
    setLoaded((l) => Math.max(l, Math.min(n, next + 2)));
  };

  useEffect(() => {
    const el = root.current;
    const hero = el?.closest("section");
    if (!el || !hero) return;
    let onScreen = true;
    const update = () => setVisible(onScreen && document.visibilityState === "visible");
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      update();
    });
    io.observe(hero);
    // Hover holds only for a mouse: on touch screens a tap leaves :hover stuck on and would freeze the slider.
    let hovered = false;
    let focused = false;
    const sync = () => setHeld(hovered || focused);
    const enter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hovered = true;
      sync();
    };
    const leave = () => {
      hovered = false;
      sync();
    };
    const focusIn = () => {
      focused = true;
      sync();
    };
    const focusOut = () =>
      requestAnimationFrame(() => {
        focused = hero.contains(document.activeElement);
        sync();
      });
    hero.addEventListener("pointerenter", enter);
    hero.addEventListener("pointerleave", leave);
    hero.addEventListener("focusin", focusIn);
    hero.addEventListener("focusout", focusOut);
    document.addEventListener("visibilitychange", update);
    // The second image starts loading once the first has painted.
    setLoaded((l) => Math.max(l, Math.min(n, 2)));
    return () => {
      io.disconnect();
      hero.removeEventListener("pointerenter", enter);
      hero.removeEventListener("pointerleave", leave);
      hero.removeEventListener("focusin", focusIn);
      hero.removeEventListener("focusout", focusOut);
      document.removeEventListener("visibilitychange", update);
    };
  }, [n]);

  const running = !userPaused && visible && (override || !held);
  const advance = () => {
    const next = (current + 1) % n;
    setCurrent(next);
    setLoaded((l) => Math.max(l, Math.min(n, next + 2)));
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") show(current + 1);
    else if (e.key === "ArrowLeft") show(current - 1);
  };

  return (
    <div ref={root} className="absolute inset-0 -z-10" data-demo={demo ? "hero-slider" : undefined}>
      <div role="region" aria-roledescription="carousel" aria-label="Photographs" onKeyDown={onKey} className="absolute inset-0">
        {slides.map((s, i) => (
          <div
            key={s.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${n}`}
            aria-hidden={i !== current}
            className={`absolute inset-0 transition-opacity duration-[800ms] ease-in-out motion-reduce:transition-none ${i === current ? "opacity-100" : "opacity-0"}`}
          >
            {i < loaded ? <SlideImage slide={s} first={i === 0} /> : null}
          </div>
        ))}
        {/* Legibility: navy from the text side, lighter toward the far edge (heavier on phones, where text spans the width). */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/65 to-navy/80 lg:bg-gradient-to-r lg:from-navy/85 lg:via-navy/55 lg:to-navy/10" />

        {n > 1 ? (
          <div className="absolute right-0 bottom-0 left-0 z-10">
            <div className="container-site flex items-center justify-end gap-4 pb-6 lg:pb-8">
              <div className="flex items-center gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.src}
                    type="button"
                    onClick={() => show(i)}
                    aria-label={`Show image ${i + 1} of ${n}`}
                    aria-current={i === current ? "true" : undefined}
                    className="group grid h-11 w-8 place-items-center"
                  >
                    <span className="block h-1 w-full overflow-hidden rounded-full bg-white/35">
                      {i === current ? (
                        <span
                          onAnimationEnd={advance}
                          style={{ animationPlayState: running ? "running" : "paused" }}
                          className="hero-progress block h-full w-full origin-left rounded-full bg-accent-on-dark"
                        />
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setOverride(userPaused);
                  setUserPaused(!userPaused);
                }}
                aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
                className="grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 motion-reduce:hidden"
              >
                {userPaused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Art direction: a slide with its own phone crop serves it below 640 px. */
function SlideImage({ slide, first }: { slide: Slide; first: boolean }) {
  const common = {
    alt: slide.alt,
    sizes: "100vw",
    fetchPriority: first ? ("high" as const) : undefined,
    loading: first ? ("eager" as const) : ("lazy" as const),
  };
  const { props: wide } = getImageProps({ ...common, src: slide.src, width: slide.width, height: slide.height });
  // The phone crop can need its own focal point; object-position can't vary per <source>, so a media query does it.
  const cls = "absolute inset-0 h-full w-full object-cover [object-position:var(--pos-phone)] sm:[object-position:var(--pos)]";
  const style = { "--pos": slide.position, "--pos-phone": slide.phone?.position ?? slide.position } as CSSProperties;
  if (!slide.phone) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- getImageProps output; alt is in `wide`
    return <img {...wide} className={cls} style={style} />;
  }
  const { props: phone } = getImageProps({ ...common, src: slide.phone.src, width: slide.phone.width, height: slide.phone.height });
  return (
    <picture>
      <source media="(max-width: 639px)" srcSet={phone.srcSet} sizes={phone.sizes} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- getImageProps output; alt is in `wide` */}
      <img {...wide} className={cls} style={style} />
    </picture>
  );
}
