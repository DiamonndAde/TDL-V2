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

## 2026-10-24 — Generated images in the home frames

- **Owner's decision:** the demo read as ten identical navy panels, and TDL chose the WordPress site partly because it is photo-led. TDL had asked for generated images for the demo, so the exception now covers every unnamed, non-premises demo frame (AGENTS.md, PLACEHOLDERS.md), in presentation builds only.
- **Eight wired:** About and the seven service rows, one scene per frame matched to its content. All passed the full-size checks (hands, faces, text, logos, bars). Shipping builds are unchanged: the brand panels stay until TDL's photographs arrive.
- **Why TDL re-run in portrait.** Its frame is 5:7 at `lg` and 4:5 on phones; the wide shot cropped to one person. The 1024×1536 re-run shows both people inside the frame at 1280, 768 (where the frame is 4:3) and 390. It waits for the owner's OK; until then the frame shows its panel.
- **Stock dropped from the page.** Beside the warm generated set it was cooler and higher-contrast, and it duplicated two row scenes. Records kept.
- `PhotoFrame` prefers, in order: a TDL photograph, then a generated frame image, then stock (empty now), then the brand panel. The frame type is renamed `StockFrame` → `DemoFrame`.
- **Why TDL portrait wired** (owner's OK). From `sm` to `lg` the frame is 4:3, and the bottom-left badge covered the man's hands, so there the badge moves to the top-left. The first try clipped the top of his head at 768, so the 4:3 crop also moves up the portrait (`sm:max-lg:[object-position:50%_25%]`, through a new `imageClassName` on `PhotoFrame`). Checked clear of everyone at 390, 640, 768, 1023 and 1280.

## 2026-10-24 — Services (step 7)

- **Inner-page parts,** built from the home page's own pieces since WordPress had no inner pages:
  - `PageHeader`: a mist band, the page's one H1, an optional eyebrow, lead, actions and a frame beside it from `lg`.
  - `CtaBand`: a charcoal close with the response promise, "Partner with us", "Prefer a form? Become a client" and the phone.
  - `FeatureCard`: the Why-TDL card, now shared with Why TDL itself.
- **`/services`** reuses the home page's seven rows (`ServiceRowList`, headings at H2 there) under a page header.
- **`/services/[slug]`**, seven static pages from one template:
  - The eyebrow is the service name and the H1 is what the service takes off the buyer's desk (v1 copy, Q23).
  - The frame is the service's home-row image (or its panel).
  - Sub-services are cards, the close is scoped (the WhatsApp message and `/become-a-client?service=` carry the service), and the other six are linked cards.
  - Unknown slugs 404 through `notFound()`. `dynamicParams = false` is not available under Cache Components (bundled docs), so the build lists a `◐` shell for `/services/[slug]`.
- `verify.sh` runs `next typegen` before `tsc`: route types (`PageProps<'/services/[slug]'>`) are generated, and a new route fails typecheck until they are.

## 2026-10-24 — About, Work, Certifications, legal, Insights (step 8)

- **About:**
  - Page header with the About frame (generated team image in demo builds, panel otherwise; no caption claims TDL).
  - Story, then vision and mission as cards, and SPICE as five letter cards.
  - Management and board with their verbatim bios ("TOluwalase", Q5), then the MD quote panel.
  - "Where to find us" is an address card, not a photo frame: a frame captioned with TDL's address may only ever hold TDL's own photograph (Q18).
- **Named people get initials monograms in every build** (navy, lime Space Grotesk), the designed fallback, as the brand panels are for photographs. v1 showed monograms only in demo builds and "Portrait to come" boxes otherwise; an empty box reads as broken, and initials claim no likeness.
- **Work:** the three accounts as situation / ran / said cards plus the full quote. Each section is anchored (`#carlcare`, `#chi`, `#transsnet`) for the home testimonial links. Names are gated on Q21; typos are kept (Q22).
- **Certifications:** the ISO badge, the two PDFs as cards, and two dashed "To come" rows (Q19).
- **Privacy and cookies:** verbatim (Q25), with no motion. **Insights:** a stub, noindex, not in the nav or sitemap.

## 2026-10-24 — Contact and the enquiry form (step 9)

- **Contact:** direct lines first as four cards (phone, WhatsApp, email, the office with a Google Maps link and no embed, so no third-party script runs before consent). Then the brochure QR (change 7, drawn at build time, navy on white, encoding the stable `/brochure`) and the new-client close.
- **Enquiry form:** v1's three steps, schema, resolver and server action, logic unchanged and restyled. It keeps v1's lessons:
  - `?service=` is read after mount, not with `useSearchParams`, which kept the form out of the HTML and cost CLS 0.60 in v1.
  - The honeypot is accepted and delivers nothing.
  - Failure reasons are an enum, never the error text.
  - The success screen uses `getValues()` instead of `watch()`: it renders once, and `watch()` defeats React Compiler memoisation (lint warning).
  - Analytics calls are stripped until step 11.
- **Form test** (`npm run test:form`, Tier 3) ported unchanged; all 18 checks pass. It was seen to fail when the action sent service slugs instead of names. The slider test now also checks the contact QR (target `/brochure`, demo-marked, plain link beside it).
- **Scroll test** runs on one route per template (`SCROLL_ROUTES` in `verify.sh`); on all routes it had grown to 7 minutes.
- **Link check** (`scripts/link-proof.py`, Tier 2; owner's request after every menu link 404ed on the live site):
  - Crawls every internal page from `/` and requests every link in the header, footer and body without following redirects.
  - A 200 passes. A 307/308 passes only if it is a deliberate `next.config.ts` redirect whose destination returns 200.
  - `#fragments` must exist on the destination page. External links must be https, mailto or tel.
  - `PENDING_ROUTES` in `verify.sh` names planned routes (now only `/careers`); links to them report NOT YET, visibly, until the route lands.

  First run: 17 pages, 46 distinct internal links. Without the pending list it failed on `/careers` (linked from 16 pages), the real 404 still live.

## 2026-10-24 — Careers (step 10)

- **One careers page** (change 4); `/career`, `/job-openings` and `/jobs` redirect here. Order as TDL asked: open roles first, a link to TDL's ATS board that opens in a new tab (Q14, from the adapter so the page names no provider, Q29); then the talent-pool form; then diversity and perks, verbatim. The header frame reuses the recruitment row's image.
- **Recruitment adapter** ported unchanged (`types`, `index`, `zoho`, `webhook`, `none`, `board`). The boundary check's recruitment section now runs: it was seen to fail on a direct Zoho import in the careers page (two failures: the import and the provider's export). Its closing line now names only the sections that ran.
- `FailureReason` moved to `src/lib/form-result.ts`, shared by both actions.
- **Provider proof** (`npm run test:provider`, Tier 3) passes every branch against a local stub.
- **Link check strict:** `PENDING_ROUTES` is empty, and every link on every page must resolve.
- **Form routes are the heaviest:** `/become-a-client` and `/careers` carry 47.1 and 48.6 KB of our own JS (budget 60). That is a shared 32 KB chunk (react-hook-form and `zod/mini`) plus the forms. Step 11 must keep within it; the PostHog SDK loads lazily after consent and does not count.

## 2026-10-25 — Analytics (step 11)

- **Ported from v1, behaviour unchanged:** `src/lib/analytics/*`, `after-first-paint`, the provider, runtime, lazy gate, page-viewed and consent-reopen components, and `docs/ANALYTICS-PROPOSAL.md`. With `NEXT_PUBLIC_POSTHOG_KEY` empty (every deployed environment today) there is no banner, no SDK download and no request. With a key: consent first, nobody identified (`person_profiles: "never"`), exception capture off, all inputs and text masked in replay, replay on `/careers` only at 5%.
- **Consent banner restyled for v2:** fixed navy bar, two identical outlined buttons (Accept, Reject) that differ only in the word, mounted after first paint, a labelled region with a polite live line, focus never moved or trapped. "Analytics choice (on/off)" in the footer reopens it once a choice is made.
- **Banner copy kept short.** The first version ran to five lines at phone width and became the LCP element on `/services` and `/contact-us`, whose page leads are short. v1's check matched "consent" in the LCP element's class name, so it passed. The check now asks whether the LCP element sits inside the banner and runs on every route; it fails on the long copy and passes on the two-line copy.
- **Instrumentation restored** to both forms (field focus and leave by index, step viewed/completed/blocked/back, submitted with counts only, failed with the enum reason), the careers page (`careers_viewed`), the open-roles link (`openings_clicked`, with the switched-off wording experiment in `OpeningsLink`), and "Partner with us" (`whatsapp_clicked` with its location: header, menu, hero, close, service_hero, service_close, contact, footer). `PartnerCta` is now a client component for the click; `track()` is a no-op without a key and consent.
- `FailureReason` has one definition (`src/lib/form-result.ts`); the event contract re-exports it.
- **Tests:** `npm run test:consent` and `npm run test:masking` (Tier 3, via `scripts/analytics-proof.sh`) build with a key pointed at the local PostHog stand-in, run the proofs, and restore the shipping build. Masking: 16 payloads captured (12 event, 4 replay), the failed-submission path ran, and no canary token appears under any decoding. The masking test was seen to fail when the stub could not open a Git Bash `/tmp` path (0 payloads, four failures); Python now gets Windows paths. The boundary check's analytics section now runs.
- **`.env.local` holds a demo PostHog key.** `verify.sh` and every test script set it empty, so shipping builds carry none. Vercel builds from its own variables, so production stays analytics-off until a key is added there (Q30). `next dev` locally will show the banner.

## 2026-10-25 — Tier 3 in full (step 12)

- **`scripts/harden.py` rewritten for v2** (v1's tested the Roster canvas and service tabs). It checks:
  - every route serves 200, and its trailing-slash form 308s to it;
  - every redirect is a single 308 (the 307 for `/brochure`) to a page that answers 200;
  - WordPress leftovers end in a clean 404;
  - the sitemap holds exactly the indexable routes; robots points at it; `/insights` is noindex;
  - a `*.vercel.app` host gets `X-Robots-Tag` and the real host does not;
  - JSON-LD parses with no raw `<` and no duplicate `@id`, with Organization and LocalBusiness on every page and the right Service nodes;
  - every title and meta description is unique;
  - axe on 15 routes at 1280 and 390;
  - keyboard paths: skip link, header, testimonial links in order to real anchors, the marquee pause, the phone popover menu (Enter, Tab inside, Escape back to the toggle) and the three-step form;
  - reduced motion: figures final at t=0, nothing animating after a full scroll, the headline whole.
- **First run found a real defect:** `/about-us` and `/contact-us` rendered Organization and LocalBusiness again on top of the root layout's, duplicating the `@id`s. Removed. The header hairline is a scroll-driven timeline and is excluded from the "nothing animating" check: it tracks scroll position, not time.
- **Throttled-mobile probe ported with three corrections:**
  1. **Loads are cold**, in a fresh context. v1 reused one context, so every route after the first loaded on cached framework chunks.
  2. **Three runs per route, gated on the median.** Single cold runs of one build spread from 1.6 to 2.7 s on this machine.
  3. **Only real interactions count** (`interactionId`, as INP is defined). Each control is scrolled into view and settled before the tap, and each step is gated on the median of three rounds. Letting Playwright scroll inside the action billed 4.2 s to one radio tap, while a 500 px page scroll reached its next frame in 24 ms; one round of the same tap read 104 ms and then 208 ms.
- **Measured** (4× CPU, 150 ms RTT, 1.6 Mbps, 412×823). This was taken with the owner's own Chrome and another project's server holding the CPU at about 48%, so absolute numbers run high.
  - Final run: inner routes median LCP 1.1–1.6 s; home 2.28 s (runs 1.92, 2.28, 2.84). Worst median interaction 176 ms (home, next testimonial). CLS 0.000 everywhere. The fling's longest task is 78 ms.
  - **Home stays open.** Its median passed in the last two runs (1.86 and 2.28 s) but read 3.1 s in two earlier ones, and its slowest single runs exceed 2.5 s; one paired run had home and `/services` at the same FCP. The trace shows a race. Home's first render (style plus layout, about 0.9 s at 4×, twice the nodes of an inner page) is followed by hydration in the 72 KB framework chunk (0.7–1.3 s at 4×). When that chunk lands before the first frame commits, hydration holds the paint. v1 recorded the same drift on `/` ("≤ 2.0 s median, one run in five over 2.5 s").
  - Ruled out: `content-visibility: auto` on below-fold sections made it no faster (A/B, five cold runs each).
  - Next step: measure on a quiet machine or with PageSpeed Insights on the deployed site before changing the page.
- **Lighthouse runner fixed twice:**
  - v1 force-killed every `chrome.exe` between runs, which closes the owner's browser. It now runs Lighthouse on Playwright's Chromium and kills only that executable's Lighthouse profiles.
  - Launched from Windows Python, a bare `bash` resolved to WSL's `System32\bash.exe`, which ran nothing and printed "done". Tier 3 now passes Git Bash's absolute path.
  - The gate is unchanged from v1: accessibility 100 and CLS < 0.1 are gated; simulated performance is recorded, not gated.
- **Masking test: a stale-stub bug, found by the first full Tier 3 run** (0 payloads inside `verify.sh`).
  - `analytics-proof.sh` killed the stub with `taskkill //F`, but with `MSYS_NO_PATHCONV=1` exported the double slashes reach Windows and the kill fails silently. Four stubs from this session were still listening on 3132.
  - Python's `HTTPServer` sets `SO_REUSEADDR`, which on Windows lets a second process bind the same port, so a new stub shared traffic with old ones. The earlier standalone pass was reading a capture file that an older stub also wrote to.
  - Fixes: PowerShell `Stop-Process` by port; the stub binds without address reuse (a second stub now fails with WinError 10048, seen); `analytics-proof.sh` stops if the stub does not start.
  - Clean rerun: 16 payloads (12 event, 4 replay), the failure path exercised, no canary token, and nothing left on 3132 afterwards.
- **Lighthouse** (simulated, mobile, same build): accessibility 100 and CLS 0.000 on all nine template routes; performance 63–88, LCP 2.9–3.5 s, TBT 230–1,460 ms. Recorded, not gated, as in v1. Lantern on localhost bills framework bootup to LCP, and this machine was under load.

## 2026-10-25 — No demo note on the contact page; home LCP measured on the live demo

- **The contact page shows no demo note.** The "Demo build: this code points at the demo site. Do not print it." line is gone (owner); nothing demo-related is visible on any page. The rule, never print a QR from a demo build, is in `HANDOFF.md` and `PLACEHOLDERS.md`. The slider test now asserts that no demo note is visible on `/contact-us`, where it used to assert the note was there.
- **Home LCP closed.** PageSpeed Insights, mobile (Moto G Power, slow 4G, Lighthouse 13.5), on https://tdlv2-three.vercel.app/, three separate analyses at 02:23, 02:25 and 02:26: LCP **1.8, 2.3, 2.3 s**; FCP 0.9, 1.2, 0.9 s; TBT 0–20 ms; CLS 0; performance 100, 96, 99. There is no field (CrUX) data for the demo host. All three runs are under 2.5 s, so the page is unchanged; the local probe's slow runs came from this machine's load. The key-less PSI API was over its daily quota, so the runs went through pagespeed.web.dev, which runs the same analysis on Google's servers.
