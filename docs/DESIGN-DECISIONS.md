# Design decisions — TDL website v2

Newest last. Each entry records what was decided, why, and what it replaced. v1's log (`../tdl-website/docs/DESIGN-DECISIONS.md`) is history for the previous design and does not bind v2.

---

## 2026-10-24 — Phase 1 decisions approved (D1–D4)

The owner approved `docs/PLAN.md` §1 with one change, to D1:

- **D2:** headings in Lato, matching WordPress; Space Grotesk only where WordPress used it.
- **D3:** client logos as a marquee with a pause control. The outlined "Testimonials" word is static.
- **D4:** the home slider is the hero background, with a plain navy hero in production until TDL's photographs arrive.
- The smaller defaults in §1 stand.
- The PostHog demo scripts (`posthog-setup.mjs`, `posthog-seed.mjs`) are not ported for now.

## 2026-10-24 — D1: the accent is green, derived from the logo's lime

**Decision.** The accent is green, not olive. TDL liked the WordPress look and green is part of it. The supplied logo has a lime arc (`#A4CE3C`), so green belongs to the brand rather than to the Astra template. WordPress's own green (`#54B435`, hue 105°) is not used: it came from the template, not from TDL.

**Derivation.** The lime is HSL(77°, 60%, 52%). It is 1.83:1 on white, so it fails even the 3:1 large-text threshold. It can only be decoration on light grounds. The text-and-button green keeps the lime's family and darkens it:

| Token | Value | Use | Contrast |
|---|---|---|---|
| `--lime` (`--color-accent`) | `#A4CE3C` | Large decorative accents only on light grounds: the "//" quote mark, rules, icon tiles, the testimonial gradient tint. **The accent on dark grounds** | 1.83 on white (decoration only); 5.49 on charcoal `#424242`; 8.80 on coal `#212121`; navy text on lime 9.75 |
| `--green` (`--color-accent-strong`) | `#53741B`, HSL(82°, 62%, 28%) | Buttons, links, small text, highlighted heading words on light grounds, active nav | **5.41 on white**, 4.92 on mist `#F4F4F4` |
| `--green-hover` | `#476317`, HSL(82°, 62%, 24%) | Hover and pressed state | 6.85 on white |

The hue moves 5° toward green (77° → 82°). At 77° and this lightness the colour reads as olive-brown, which would undo the decision; at 82° it still sits beside the lime as the same family. Candidates checked: hue 77/82/88/95 at lightness 24–32%. 82° at 28% is the lightest that clears 4.5:1 on both white and mist.

**Highlighted words in headings use `--green` on light grounds, not lime.** WordPress put its green on white headings at 2.64:1. We don't copy that failure.

**Peach does not stay.** Rendered side by side (`docs/reference/accent-peach-vs-lime.png`), peach next to the green buttons read as a second brand. Lime on the dark grounds repeats the WordPress pattern (a green accent word on the charcoal services band) and passes AA there (5.49:1). So:
- On dark grounds the accent is lime.
- The Why-TDL badge, yellow `#FFDC4B` on WordPress, becomes lime with navy text (9.75:1).
- The carousel indicators are lime on dark and `--green` on light.

**Swapping to olive is one line.** Both palettes are defined in `src/app/globals.css` under `[data-accent="green"]` and `[data-accent="olive"]`. The root layout sets `data-accent="green"` on `<html>`. Changing that one attribute switches every accent role. The olive set keeps the phase-1 values: `#7A7D59` large accents, `#5F6136` text and buttons (6.4:1), peach `#E8BF96` on dark (5.90 on charcoal).

## 2026-10-24 — Header, menu and footer (step 3)

- **Sticky header (change 2):** `position: sticky`, white, 88 px from `lg` and 64 px below. A hairline and soft shadow fade in over the first 80 px of scroll as a CSS scroll-driven animation (`animation-timeline: scroll(block root)`), gated by `@supports ((animation-timeline: scroll()) and (animation-range: 0% 100%))`. It is decorative, so there is no JS fallback: Firefox shows the hairline from the start. The scroll test asserts that the header is still on screen at the bottom of every page.
- **Logo (change 3):** the supplied PNG, 40 px tall on phones, 48 px at `lg` and 58 px at `xl` (WordPress used 35 px). On the coal footer it sits on a white tile, because the olive wordmark is ~2.5:1 on coal.
- **Desktop nav from 1024 px.** At 1024 the full row fits: logo, five links, "Paytrail staff login" (change 1) and "Partner with us" (change 5). Below that, a menu.
- **Mobile menu:** a native popover opened by `popovertarget`, so it works before hydration and gets light-dismiss, Escape and the expanded state from the browser. Script does two things: close it after a client-side navigation, and import `@oddbird/popover-polyfill` only where `HTMLElement.prototype.popover` is missing (iOS before 17). Invoker commands (`commandfor`) were not used: they became Baseline only in Dec 2025 and would need a second polyfill.
- **Footer:** the WordPress coal `#212121`, now carrying contact details, services, company pages, the Paytrail staff login portal, social links and legal links. The copyright year is a `'use cache'` component with `cacheLife('days')`; Cache Components forbids reading the clock in a prerender without a cache boundary. The pages therefore show a 1-day revalidate, and they are still static.
- **Sitemap without `lastModified`:** a `new Date()` there made `/sitemap.xml` render per request under Cache Components.
- **Windows: orphaned servers.** `first-load.mjs` (from v1) used `server.kill()` on a `shell: true` spawn, which on Windows kills only the shell and orphans `next start`. Four orphans had piled up, and a build made beside them served stale CSS. It now kills the process tree, and `verify.sh` stops any `next start` before building.

## 2026-10-24 — Hero (step 4)

- **H1 typing is CSS from the server HTML.** Every character of "You run the business." is a span with its index. The H1 holds a visually hidden copy of the whole sentence, and the animated copy is `aria-hidden`. Measured: typing begins at first paint (616 ms on local) and finishes ~0.9 s later, so it never delays FCP.
- **Animations end on the base style.** The first version used `forwards` fills and left carets stuck on six characters: at the exact end, float rounding landed on the start keyframe. In the opacity animation the same fault would have left letters invisible. Now the hide uses a `backwards` fill only during the delay, and the caret exists only while its animation is active. Anything that goes wrong leaves the text readable. This is a rule in AGENTS.md.
- **The sub-line doesn't fade in.** Without photographs it is the LCP element, and its fade from opacity 0 put LCP at 1,540 ms on an unthrottled local load. Without the fade it is ~550 ms (desktop) and ~100–160 ms (phone). Only the button rises.
- **Slider clock = the indicator's fill animation.** The slider advances on `animationend`, and pausing is `animation-play-state`, so a resume continues where it stopped. Under reduced motion there is no animation, so it never advances by itself; the Pause control is hidden with CSS (`motion-reduce:hidden`), so nothing flashes.
- **Holds:** a mouse over the hero or focus inside it holds the slider. Touch doesn't hold, because a tap leaves `:hover` stuck on. Pressing Play overrides the hold, since the pointer and focus are on the Play button at that moment; Pause or manual navigation ends the override.
- **Images:** the first is eager with `fetchpriority="high"` (`priority` is deprecated in Next 16) and is the LCP element in demo builds. Each later image loads when the one before it shows. The phone crop is served through `<picture>` with `getImageProps`, and its focal point comes from a media-query CSS variable, because `object-position` can't vary per `<source>`.
- **Production hero is plain navy** (D4) until TDL's photographs arrive (Q27).

## 2026-10-24 — Figures, About, quote, services (step 5)

- **Figures strip:** the WordPress four-up with corrected facts (ISO 9001:2015 · since 2000 · 100+ clients · 5,000+ managed staff), Lucide icons in `accent-strong`, and figures in Space Grotesk. Count-up comes in step 6.
- **About:** WordPress's copy (Q33). The photograph runs to the viewport edge as on WordPress, with "Learn more" over its corner, now pointing at `/about-us`.
- **Quote:** the "//" mark sits above the indented quote; the first layout overlapped the first word. "TOluwalase" is kept (Q5).
- **Service rows:** all seven lines, alternating, with a coal card overlapping the frame and the white rule protruding past the card's outer edge, as on WordPress. Card copy is v1's `lead` (Q23); each card links to its service page with an `inSentence()` label.
- **Brand panel** for frames without a photograph: navy, the logo's lime arc at 25%, and the frame's Lucide icon in lime. In service rows the icon centres in the part of the frame the card leaves visible. The frame reserves its aspect ratio whether it shows a photograph or a panel, so nothing shifts when photographs arrive.
- **Demo stock: two photographs, not nine.** Only Unsplash kwzWjTnDPLk (About) and Pexels 30688591 (Why TDL) passed every criterion; PLACEHOLDERS.md lists each rejection and why. The service rows keep their panels in every build rather than mixing two photographs with five panels. **Owner's decision pending:** relax the "location stated" criterion to fill them, or wait for TDL's photographs.

## 2026-10-24 — Testimonials, logos, Why TDL, and the motion layer (step 6)

- **Why not `whileInView`.** It renders its starting state (`initial`) on the server, so the content would ship at opacity 0, invisible without JavaScript. That is the WordPress fault the audit found (§5) and the first motion rule in AGENTS.md. `<Reveal>` uses the same once-in-view behaviour from motion's own primitives: `inView` and `useAnimate` from `motion/react-mini`. The server HTML is always visible. After hydration, and only when motion is allowed, elements that start **below the fold** are set hidden and then animate in once when they enter view. Anything already on screen is never touched. Effect on the bundle: the WAAPI-only mini build instead of `LazyMotion` + `domAnimation`. Own JS on `/` went from 13.6 KB to 19.8 KB (budget 60) with every section, the motion layer, the carousel and the marquee in place.
- **Typed accent words** ("TDL", "Core", "global brands", "Total Data") type in view, once, using the same CSS as the H1 (the end state is the base style). WordPress typed them at page load off-screen. **Counts** (100+, 5,000+) count up in view only if they start below the fold; at 1280×900 the strip is partly visible at load, so it doesn't count there. Both keep a visually hidden final value for assistive technology.
- **Testimonials (change 9):** three cards in one row from `lg`. Each card has the client logo, one verbatim sentence, the name, the role and company, and "Read the full quote" linking to `/work#<id>`. Below `lg` it is a native scroll-snap carousel, so swipe works without script (WordPress disabled swipe), with prev/next, "1 / 3" (polite live region) and Pause. It auto-advances every 6 s only below `lg`, on screen, with motion allowed, and with nothing holding it. The outlined "Testimonials" word is static (D3).
- **Logo marquee (D3):** pure CSS, two identical rows each padded by one gap so −50% is exactly one row, 45 s a loop. It pauses on hover, focus or its Pause control. Under reduced motion it becomes one static wrapped row, and the duplicate row goes. Full-colour logos as on WordPress; the 15 from v1 (Q24, Q17).
- **Why TDL:** the "since 2000" badge in lime with navy text replaces WordPress's yellow "10 +" counter. The cards link to `/services` and `/certifications` with whole-card hit areas.
- **Reveal test** (`scripts/reveal-proof.py`, Tier 2):
  - JS off: all text visible.
  - Reduced motion: nothing armed, nothing moves, no pause controls.
  - Motion on: on-screen content is never hidden, below-the-fold content waits and then shows once.
  - Marquee: runs, pauses on hover and by its control.
  - Carousel: advances below `lg`, Pause holds it, one row at `lg`.

  Seen to fail with `Reveal` shipping opacity 0 (57 hidden elements without JS) and with typed words that never run. One flaw was fixed while proving it: the on-screen check read each element's own opacity, so a hidden wrapper could pass. It now multiplies through ancestors.

## 2026-10-24 — Horizontal overflow on Windows (owner's review of the deployed site)

- **Cause:** the About photograph bled to the viewport edge with `xl:-mr-[calc((100vw-75rem)/2+2rem)]`. `100vw` includes a classic scrollbar, so on Windows the page was one scrollbar wider than its viewport: scrollWidth 1273 vs clientWidth 1265 at 1280, and 1913 vs 1905 at 1920.
- **Why every test passed:** headless Chromium launches with `--hide-scrollbars`, so `100vw` equalled the layout width in every test.
- **Fix:** a `.bleed-grid` utility with named lines (`[full-start] gutter [content-start] half [mid] half [content-end] gutter [full-end]`). The photograph spans `mid / full-end`. Grid tracks resolve against the container's width, which excludes the scrollbar. Measured: the image ends exactly at clientWidth at 1024, 1280 and 1920. `overflow-x: clip` on the section is a safety net; it's clip, not hidden, so there's no scroll container and the sticky header still sticks. A second trap found on the way: `.container-site` (a custom utility) outranked `lg:max-w-none lg:px-0` on the same element, so the grid stayed boxed until it used plain utilities. Both are now AGENTS.md rules. No other `vw` remains outside `sizes`.
- **Test:** `scripts/overflow-proof.py` (Tier 2) launches Chromium with `ignore_default_args=["--hide-scrollbars"]`. It confirms a classic scrollbar exists (15 px here), then asserts scrollWidth === clientWidth on every route plus the 404 page at 390, 1280 and 1920. It failed first with exactly the reported numbers and named the About wrapper.
