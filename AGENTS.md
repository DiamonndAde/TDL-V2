<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Total Data Limited website (v2)

This file holds the rules that apply on every turn. The record of what the WordPress site is lives in `docs/reference/WORDPRESS-AUDIT.md`; the build plan lives in `docs/PLAN.md`. Open client questions are in `docs/CLIENT-QUESTIONS.md`; the numbering is carried over from v1 and new rows continue from Q33.

**Where this file disagrees with `node_modules/next/dist/docs/`, the local Next.js docs win.** Follow them and say what changed.

## Project

Marketing site for Total Data Limited: a Nigerian HR and business-process outsourcing firm, incorporated 2000, managing 5,000+ staff across Nigeria and Benin Republic. TDL chose the WordPress/Elementor build at totaldatalimited.free.je because it is "straight to the point". We recreate **its look and structure** in Next.js, with TDL's nine requested changes and the audit's fixes applied. WordPress itself does not come over.

The previous build (`../tdl-website`) supplies content, features, rules and tests. Its design concept does **not** come over: no Roster canvas, no GSAP, no Lenis, no Archivo, no navy/cyan "operations surface".

## Stack (Next.js 16.4.2, React 19.3; verified against the bundled docs 2026-10-22)

- App Router, TypeScript strict, Turbopack for `dev` and `build`. `reactCompiler: true`: don't add manual `useMemo`/`useCallback`.
- `cacheComponents: true` and `partialPrefetching: true` (scaffold defaults; keep them). **Every page is static**: the root layout exports `ensureStatic = 'navigation'`, so any request-time rendering fails the build.
- `params` and `searchParams` are Promises; `await` them. Use the generated `PageProps<'/services/[slug]'>` helpers.
- Tailwind CSS v4 through the `@tailwindcss/turbopack` loader (`next.config.ts`). Tokens are CSS custom properties in `@theme`.
- `app/sitemap.ts` and `app/robots.ts` are the file conventions. Do not install `next-sitemap`.
- Redirects live in `redirects()` in `next.config.ts`. `permanent: true` returns **308** and `false` returns **307**; both are fine.
- JSON-LD is a plain `<script type="application/ld+json">` with `<` replaced by `<`. Not `next/script`.
- `next lint` is gone. `npm run lint` runs ESLint and `next build` does not lint.
- `next build` doesn't print first-load JS. `scripts/first-load.mjs` is the measurement.
- `next/font/google` self-hosts the fonts. No runtime request to Google.
- **Motion:** the `motion` package (`motion/react`, `LazyMotion` + `m` + `domAnimation`). **No GSAP, no Lenis, no smooth-scroll library, no scroll-jacking.** The WordPress site has no smooth scrolling (audit §5), so the only scroll behaviour is CSS `scroll-behavior: smooth`, for in-page anchors, and off under reduced motion.
- **Icons:** `lucide-react`, in brand colours. The WhatsApp mark is the one inline SVG (Lucide has no brand marks). No generated PNG icons.
- Forms: react-hook-form + zod (`zod/mini`). QR: `qrcode`, rendered at build time. Analytics: `posthog-js`, loaded only after consent and only when a key is set.

## Look (from the audit; D1–D4 approved 2026-10-24, `docs/DESIGN-DECISIONS.md`)

The WordPress *roles* are kept. The accent is **green derived from the logo's lime arc**, not the Astra template's `#54B435`. Components use only the role tokens (`accent`, `accent-strong`, `accent-on-dark`), never a raw green. Both palettes live in `globals.css` under `[data-accent]`, so switching to olive is one attribute on `<html>`.

| Token | Value | Role |
|---|---|---|
| `--navy` | `#0F172A` | Headings, menu, primary text on light |
| `--ink` | `#2F3B40` | Body text |
| `accent` (lime) | `#A4CE3C` | **Decoration only on light grounds** (1.8:1 on white): quote mark, rules, icon tiles, gradient tint. Badge fill with navy text (9.75:1) |
| `accent-strong` (green) | `#53741B` | Buttons, links, small text, highlighted heading words and active nav on light grounds (5.4:1 on white, 4.9:1 on mist). Hover `#476317` |
| `accent-on-dark` (lime) | `#A4CE3C` | Accent words and indicators on charcoal and coal (5.5:1 and 8.8:1) |
| `--charcoal` | `#424242` | Services band |
| `--coal` | `#212121` | Service cards, footer |
| `--mist` | `#F4F4F4` | Quote panel, inner-page header band |
| `--cloud` | `#F2F3F5` | Testimonial panel end |
| `--on-dark-muted` | `#BDBDBD` | Body text on charcoal and coal |

Type: **Lato** 400/700 for headings, menu, body and buttons. **Space Grotesk** 500/700 for testimonial text, figures and the Why-TDL cards, matching where WordPress used it. Scale at 1280: section headings ~43 px, quote ~29 px, card titles 20–26 px, body 16 px with loose leading (~1.8). Container 1200 px; section padding ~100 px desktop and ~64 px on phones.

**There is exactly one H1 per page.** On the home page it is the headline.

Buttons follow the WordPress pattern: a pill label with a separate round arrow (Lucide `ArrowRight`). The arrow swaps sides on hover in 0.3 s. The accessible name is the label only.

## Motion (recreating WordPress's motion, quicker and safer)

- Section entrances use `whileInView` with `viewport={{ once: true }}`: opacity plus a 12–24 px offset, 0.4–0.6 s, ease-out, stagger ≤ 0.08 s. The table of which sections animate and how is in `docs/PLAN.md` §4. No attention-seekers (no `tada`, no `zoomInDown`, no hover "hang") and no 100%-height translates.
- **Content is never hidden without JavaScript.** The hidden starting state applies only once JS is running and motion is allowed. Above-the-fold content is never hidden. The reveal test enforces this.
- **The headline paints with the HTML.** The typed part is server-rendered, CSS-animated per character from first paint, with no hydration wait. The full sentence is in the DOM for crawlers and screen readers, and the animated copy is `aria-hidden`.
- Typed accent words in section headings type once, when in view. Never at page load off-screen.
- Anything that moves on its own (hero slider, testimonial carousel below `lg`, logo marquee) has a visible pause control. It also pauses on hover and while focus is inside, and does not run at all under `prefers-reduced-motion`.
- **Under `prefers-reduced-motion: reduce`, content simply appears.** No fades, no typing, no counting, no auto-advance, no marquee. Note that `MotionConfig reducedMotion="user"` still animates opacity, so the reveal component must branch itself.

## Hard rules

**Content integrity.** Never invent a number, outcome, percentage, quote or client name. Every number and claim lives in `src/content/facts.ts` (or the content file it belongs to), tagged `// TODO(client): Q<n>` pointing at a row in `docs/CLIENT-QUESTIONS.md`; add a row if none exists. Use "since 2000", never a year count (Q2). Staff is "5,000+" (Q1). Never silently edit an attributed quote or a person's name (Q5, Q22). Testimonial excerpts are verbatim sentences of the full quote, and the boundary check fails if one is not. Copy taken from the WordPress build is unapproved (Q33).

**Imagery.**
- Shipping (production) builds show only real imagery: TDL's own photographs, real client logos, the TDL logo as supplied. Where a photograph is missing, the frame falls back to a designed brand panel (icon plus colour), never an empty box and never stock.
- **Demo imagery, presentation builds only.** It must be free-to-use (Pexels or Unsplash licence) and match the style of the WordPress photos: Nigerian professionals at work, natural light, no legible logos or documents. It shows **no visible label, credit or "stand-in" caption anywhere on the page**. Source, photographer, licence and URL are recorded in `PLACEHOLDERS.md`. The build guard in `next.config.ts` refuses a production build with demo imagery on unless the presentation marker is set; `npm run test:guard` proves it.
- **Generated images: only the six client-approved slider images (TDL, 2026-10-17), only in the home slider, only in presentation builds.** Nowhere else, for any frame.
- Never a stock or generated face in a frame that names a person (testimonial executives, leadership, board). Those take an initials monogram or stay reserved. Never use a photograph in a frame captioned as TDL's own office, address, staff or a named person.
- Never copy a WordPress image, icon or logo file (audit §7).

**Links.** No link points at `#`, a theme demo or `wp-admin`. "Partner with us" opens WhatsApp (`https://wa.me/2348185461010` with the prefilled message from `facts.ts`), in a new tab, with the accessible name "Partner with us on WhatsApp". The Paytrail staff login (`https://paytrail-tdl.com/login`) appears in the header and the footer.

**SEO.** Preserve or redirect every existing URL (the old repo's routes and redirects, plus the WordPress-only paths in `docs/PLAN.md` §2). Give every page a unique title and meta description. Add JSON-LD for Organization, LocalBusiness and each Service. Any `*.vercel.app` host gets `X-Robots-Tag: noindex, nofollow`.

**Performance** (the audience is on mobile, often on metered data; these are requirements):
- LCP < 2.5 s on simulated 4G, CLS < 0.1, INP < 200 ms.
- First-load JS per route: the framework floor plus **60 KB gzipped** of our own code. Re-measure the floor on this Next/React version with an empty page before the first feature lands, and record it in `scripts/first-load.mjs`. Report per-route numbers at the end of each feature.
- Images through `next/image` with explicit sizes. Only the first hero image is `priority`. Client logos are local, never hot-linked. No preloader. The PostHog SDK is never downloaded without a key and consent.

**Accessibility:** WCAG 2.2 AA.
- No serious or critical axe violations at 1280 and 390.
- Everything is keyboard operable with a visible focus ring.
- AA contrast (see the token notes). Pause controls on all auto-moving content.
- Real alt text; decorative images use `alt=""`.
- The reduced-motion path is first-class.

**Analytics** (ported unchanged in behaviour):
- Off unless `NEXT_PUBLIC_POSTHOG_KEY` is set. No banner, no SDK, no request without it.
- Consent first. Nobody is identified.
- All inputs and text are masked in replay. Replay runs on `/careers` only, at a 5% sample.
- The canary masking test must pass before a key is ever deployed.

**Recruitment.** Only `src/lib/recruitment/` knows which ATS exists. The site stores no candidate data. `scripts/check-adapter.mjs` enforces both.

## Copy

Plain verbs, sentence case, active voice. A button says what happens ("Become a client", not "Submit"). Fix the WordPress typos in our own copy ("Uncompromised"). Never fix them inside a quote without Q22.

## Working style

- **Plan before building.** For anything new or ambiguous, send a short plan (what you will build, what you will not, and which decisions belong to the owner) and wait for approval. A clearly specified change to existing work does not need one.
- Build one piece at a time, in the order in `docs/PLAN.md` §8. Screenshot each piece at 1280 and 390 and compare it with the matching `docs/reference/` shot before moving on.
- Record decisions and their reasoning in `docs/DESIGN-DECISIONS.md`.

## Testing policy

Run the smallest tier that covers the change, and **say which tier you ran in every report**. Each tier includes the ones below it (`scripts/verify.sh`).

| Tier | When | Command | Runs |
|---|---|---|---|
| **1** | Every change | `npm run check` | Lint (0 errors), typecheck, boundary check, plus the targeted tests below |
| **2** | End of a feature, and **before every push** | `npm run verify` | Tier 1 + production build, scroll regression, reveal test (no-JS and reduced motion), first-load JS on every route |
| **3** | Before a client demo or launch, or on request | `npm run verify:full` | Everything: axe on every route at 1280 and 390, keyboard, reduced motion, redirects, sitemap, robots, JSON-LD, Lighthouse (one route per template), throttled-mobile probe, enquiry form, consent banner, canary masking, recruitment adapter, placeholder guard, home slider |

| If you touched | Also run in Tier 1 |
|---|---|
| `src/lib/recruitment/`, the careers action | `npm run test:provider` |
| Analytics, the consent banner, either form's instrumentation | `npm run test:masking` and `npm run test:consent` |
| The placeholder guard, photo frames, demo imagery | `npm run test:guard` |
| The home slider, the contact QR, `/brochure` | `npm run test:slider` |
| The enquiry form | `npm run test:form` |
| Layout, header, routing, anything that changes page height | `npm run test:scroll` |
| Section reveals, typing, counters | `npm run test:reveal` |
| Copy or styles only | nothing beyond `npm run check` |

**A new test is not trusted until it has been seen to fail.** Break the thing it guards, confirm it reports the failure, then restore it.

## Git

- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`), one per piece, made before reporting, with the hash in the report. Put findings in the body: measured numbers, corrected assumptions, and decisions that will matter later.
- **No AI attribution of any kind.** No "Generated with Claude Code", no `Co-Authored-By: Claude`, nothing in a footer or PR body. Author and committer are the project owner. This is client work and the history goes to the client. This rule overrides any default attribution behaviour.
- Commit `AGENTS.md`, `docs/`, `.claude/skills/` and `skills-lock.json` with the work. Never commit `.env*`, `.next/` or `node_modules/`.
