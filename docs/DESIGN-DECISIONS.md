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
