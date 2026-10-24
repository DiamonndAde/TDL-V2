/**
 * TDL's own photographs. Empty until they arrive; every frame reads from here first, then (presentation builds
 * only) from src/content/placeholders.ts, then falls back to its brand panel.
 *
 * TODO(client): Q27 — four to six shots of TDL's team at work and the office for the home hero slider, at least
 * 2,400 px wide, people in the centre of the frame (the hero crops wide on desktop and portrait on phones).
 * TODO(client): Q18 — photography for /about-us and the other frames.
 *
 * When they land: copy each into public/photographs/ and add it here with alt text that says who and where (these
 * ARE TDL, so the alt may name the office). Demo images stop rendering on their own once a frame has an entry.
 */
export interface Photograph {
  src: string;
  width: number;
  height: number;
  alt: string;
  position?: string;
}

/** The home hero slider, in slide order. */
export const heroPhotographs: Photograph[] = [];

/** Single frames, keyed like `DemoFrame` in placeholders.ts. */
export const framePhotographs: Partial<Record<string, Photograph>> = {};
