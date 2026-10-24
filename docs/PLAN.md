# Build plan — TDL website v2

Status: **approved 2026-10-24.** D1 was changed to green derived from the logo's lime (`docs/DESIGN-DECISIONS.md`); D2–D4 and the smaller defaults stand as proposed. The PostHog demo scripts are not ported. A push for the owner's phone review comes after step 4. Read with `docs/reference/WORDPRESS-AUDIT.md` (what we are recreating) and `AGENTS.md` (the rules).

---

## 1. Decisions for the owner (each has a default; I build the default unless told otherwise)

| # | Decision | What I found | Default |
|---|---|---|---|
| D1 | **Accent colour** | WordPress uses the Astra template green `#54B435` everywhere, and recoloured TDL's logo green to match. `#7A7D59` appears nowhere in its CSS. TDL's real logo is olive `#606135`, cyan, lime and red. | **Olive**, logo-consistent: `#7A7D59` for large accents, `#5F6136` for buttons and small text (AA), peach `#E8BF96` as the accent on dark grounds. Green is not used. |
| D2 | **Heading font** | WordPress headings are **Lato 700**. Space Grotesk appears only in testimonials, the counter and the Why-TDL cards. | **Match WordPress**: Lato headings and body; Space Grotesk where WordPress used it. |
| D3 | **Client logos: marquee or static** | WordPress's logo wall is a **static** two-row grid with duplicates. Its only marquee is the giant outlined "Testimonial" word. | **Marquee, as you asked**: one row, CSS-only, ~40 s loop, pause button, pauses on hover and focus, a static wrapped grid under reduced motion. The outlined "Testimonial" word stays but does **not** move (a 236 px moving word isn't "subtle"). |
| D4 | **Where the home slider goes** (change 8) | On WordPress, the home page's main image is the hero background. | **The hero background becomes the slider**: crossfade, 6 s per image, pause button, first image static under reduced motion. In production, until TDL's photos arrive, the hero is a solid navy ground with the same text. Alternative: a slider band after the figures strip, as in v1. |

Smaller defaults, stated so you can veto them:
- Nav: About · Services · Work · Careers · Contact, then "Paytrail staff login", then the **Partner with us** button.
- The "Learn more" in About goes to `/about-us`.
- "Tailored strategies" links to `/services` and "Uncompromised compliance" to `/certifications`.
- The services band shows **all seven** service lines. WordPress dropped Technology Solutions.

## 2. Pages and URLs (all preserved; every page in the WordPress visual style)

| Route | Content source | Notes |
|---|---|---|
| `/` | WordPress structure, old-repo content | §3 |
| `/about-us` | `src/content/about.ts` | Vision, SPICE values, leadership and board (monograms or reserved frames), the office frame reserved |
| `/services` | `src/content/services.ts` | Index: seven service rows in the home-page row style |
| `/services/[slug]` ×7 | same | `human-resources-outsourcing`, `business-process-outsourcing`, `recruitment-background-check`, `learning-and-development`, `payroll-management`, `business-advisory`, `technology-solutions` |
| `/work` | `src/content/testimonials.ts` | Full quotes and case studies; the testimonial cards link here (change 9) |
| `/careers` | old repo | **One** careers section (change 4): openings link to Zoho, plus the talent-pool form |
| `/contact-us` | `facts.ts` | Address, phone, email, WhatsApp, **brochure QR** (change 7), link to become-a-client |
| `/become-a-client` | old repo | Three-step enquiry form |
| `/certifications` | `about.ts` | ISO badge, the two quality PDFs, reserved rows (Q19) |
| `/privacy-policy`, `/cookies-policy` | `legal.ts` | Verbatim (Q25) |
| `/insights` | old repo | Stub, `noindex`, not in the nav (Q13) |

**Redirects:**
- Ported: `/new-client` → `/become-a-client` (308), `/Blog` → `/insights` (308), `/index.html` → `/` (308), `/brochure` → `/brochure.pdf` (307).
- New, cheap, for WordPress-era links: `/about` → `/about-us`, `/career` and `/job-openings` and `/jobs` → `/careers`, `/contact` → `/contact-us`, `/blog` → `/insights`. All 308.

Also: `sitemap.ts`, `robots.ts`, JSON-LD (Organization, LocalBusiness, one Service per service page), and `X-Robots-Tag: noindex` on `*.vercel.app`.

## 3. Home page, in order (WordPress structure → what changes)

1. **Header**, sticky (change 2).
   - White, 88 px desktop and 64 px phone, with a hairline border once scrolled.
   - TDL's **full logo as supplied** (`logo.png`, 885×268) at 58 px tall on desktop (~191 px wide) and 40 px on phones (change 3).
   - Nav, "Paytrail staff login" (change 1), and the "Partner with us" pill, which opens WhatsApp (change 5). Hamburger panel below `lg`.
   - No Log In link.
2. **Hero**: the slider as its background, with a dark gradient for contrast (D4).
   - **H1**: "We run the HR. **You run the business.**" (change 6). The second sentence is in lime (the hero is a dark ground) and typed, CSS-only from first paint.
   - Sub-line from `facts.headline.sub`. "Partner with us" button.
   - The pause control sits bottom-right.
3. **Figures strip**: four items, each a Lucide icon in accent green with a figure and label. Content: Certified, ISO 9001:2015 · Operating since 2000 · 100+ clients (Q6) · 5,000+ managed staff (Q1).
4. **About TDL**: text left, photo right, with "Learn more" overlapping the photo.
5. **MD quote**: mist panel, lime "//" mark, garden quote (`facts.gardenQuote`), "TOluwalase Ayeni, Managing Director" (Q5).
6. **Core services**: charcoal band, "TDL **Core** services" (accent in lime on dark), sub-line, then seven alternating photo-and-coal-card rows. Each card links to its service page.
7. **Testimonials** (change 9).
   - Lime-tint to cloud gradient panel, with the outlined "Testimonials" word as a static decoration (`aria-hidden`).
   - **Three cards in one row at `lg` and up.** Each card: client logo, **one verbatim sentence** (`excerpt`), name, role and company, and a "Read the full quote" link to `/work#<id>`.
   - Below `lg`: a carousel, one card per view, with swipe, prev/next, "1 / 3" and a pause button.
8. **Trusted by Global Brands & Market Leaders**: the 15 trimmed client logos (Q24, Q17) as a marquee (D3).
9. **Why Total Data Limited?**: photo left with a lime badge (navy text) reading "Since 2000" (no year count, no counter); heading right; two cards ("Tailored strategies", "Uncompromised compliance") with Lucide icons, linked (§1).
10. **Footer**, in coal: TDL logo, address, phone, email, the WhatsApp CTA, Services links, Company links (About, Work, Careers, Certifications, Contact, **Paytrail staff login portal**), social links (Facebook labelled correctly, Q4), Privacy, Cookies, and "© {current year} Total Data Limited".

Inner pages share a **page header band** (mist ground, H1 in navy with an accent-green word, a one-line lead) and reuse the home components: photo-and-card rows, the shadowed card grid, the quote panel and the CTA band.

## 4. Motion map (WordPress → v2, all `whileInView` once, reduced motion → none)

| Where | WordPress | v2 |
|---|---|---|
| Hero headline | Typed "Scale Your" at load | Second sentence typed per character in CSS from first paint (~30 ms/char), with a caret that blinks and then stops. The full text is server-rendered |
| Hero sub and button | fadeIn, 0.7 s delay | Sub-line paints with the HTML (it is the LCP element without photographs); the button rises 12 px, 0.5 s, 0.15 s delay, CSS only |
| Hero slider | — (static image) | 0.8 s crossfade, 6 s per image, only after first paint and while on screen |
| Figures | Slide in from the sides (tablet only) | Fade + 16 px up, stagger 0.08 s, all widths. **Counters**: 5,000+ and 100+ count up once in view, 0.9 s. The final value is in the HTML |
| About | Section fadeIn | Text fades up 16 px; photo fades, 0.5 s |
| Section accent words | Typed at page load (off-screen) | "TDL", "Core", "Global Brands", "Total Data" type once in view |
| MD quote | fadeInUp 100% + `tada` | Panel fades up 24 px, 0.6 s. No wiggle |
| Services rows | Row fadeIn + card `zoomInDown` | Photo fades; card fades and slides 16 px from the photo side, 0.5 s, 0.1 s after the photo |
| Testimonials | Autoplay carousel 3 s; marquee word | Cards fade up with stagger at `lg`. The carousel runs below `lg` only, 6 s, with a pause button. The word is static |
| Logos | Static grid | Marquee (D3) |
| Why TDL | Typed heading, counter at load | Photo and cards fade up, stagger 0.08 s. The badge doesn't count ("Since 2000") |
| Buttons | Arrow circle swaps sides on hover | Same, 0.3 s, CSS |

The reveal is one client component (`<Reveal>`), loaded with `LazyMotion`. Its budget is the motion runtime (~15–20 KB gzipped, to be measured) inside the 60 KB.

## 5. Imagery plan

| Frame | Presentation build (demo) | Production until TDL's photos arrive |
|---|---|---|
| Hero slider | The six generated slider images from v1 (client-approved, slider only), no caption | Solid navy hero |
| About photo | Pexels/Unsplash: Nigerian team at work | Brand panel (navy ground, TDL mark) |
| Seven service rows | Pexels/Unsplash, one per service, same style as WordPress | Coal panel with the service's Lucide icon |
| Why-TDL photo | Pexels/Unsplash: meeting or handshake | Brand panel |
| Testimonial logos, client logos, TDL logo | Real files from v1 | Same |

- No visible labels, credits or captions on demo images; everything is recorded in `PLACEHOLDERS.md`.
- Sourcing criteria carry over from v1: a Nigerian workplace stated on the source page, mid-work, no legible logos or documents, no named people, and nothing captioned as TDL's own.
- Demo images sit behind the `PLACEHOLDER_IMAGES` build guard. The guard test proves the shipping HTML contains none of them.
- The 3:2 generated images crop to a portrait hero on phones, so they will be slightly soft at 3×. That is accepted for demos and recorded in `PLACEHOLDERS.md`.

## 6. What is ported from `../tdl-website` (exactly)

**Content (`src/content/`):** `facts.ts`, `services.ts`, `testimonials.ts`, `clients.ts`, `about.ts`, `legal.ts`, `photographs.ts`, `placeholders.ts` (registry re-pointed at the new demo set). Every `TODO(client)` tag comes with them:
- `facts.ts`: Q1, Q4, Q5, Q6, Q7, Q8, Q12, Q15, Q23 (×2), Q31
- `testimonials.ts`: Q21, Q22, Q26
- `clients.ts`: Q17, Q24
- `services.ts`: Q23
- `about.ts`: Q5, Q18, Q19, Q23
- `legal.ts`: Q25
- `photographs.ts`: Q27
- In pages and components: become-a-client action Q20; enquiry form Q12; partner CTA Q20; footer Q4; certifications Q19; privacy and cookies Q25; home headline Q23; `brochure.ts` Q32.

`coverage` (Q7, Q8, Q15) has no section in v2; it stays in `facts.ts` for JSON-LD `areaServed`.

**Features:**
- **Enquiry form:** `components/enquiry/{enquiry-form.tsx, schema.ts}` and `app/become-a-client/actions.ts`. The server action validates and delivers JSON to `FORM_WEBHOOK_URL` (honeypot; delivery error and unconfigured messages). Restyled; logic unchanged.
- **Recruitment:** `src/lib/recruitment/{index, types, zoho, webhook, none, board}.ts`, `app/careers/actions.ts`, `components/careers/{application-form.tsx, openings-link.tsx, schema.ts}`.
- **Analytics:** `src/lib/analytics/{config, consent, events, experiment, index, track, use-field-tracking}.ts`, plus the consent banner, reopen control, provider, runtime and page-viewed components. PostHog runs behind consent, off without a key, with `mask_all_text`, `maskAllInputs` and `maskTextSelector: "*"`, no identify, and exception capture off. `docs/ANALYTICS-PROPOSAL.md` comes too.
- **CTAs and links:** `ui/partner-cta.tsx` (WhatsApp mark, prefilled message, accessible name), the Paytrail link (`facts.company.staffPortal`), `lib/brochure.ts`, `lib/build-mode.ts`, `contact/brochure-qr.tsx`, `public/brochure.pdf`, `public/documents/*.pdf`.
- **Assets:** `public/brand/logo.png`; `public/clients/trimmed/*` (15) plus the three testimonial logos (`carc.jpg`, `chi-limited.jpg`, `transnet-music.jpg`) and `iso.svg`; `public/placeholders/generated/*.webp` (the six slider images and the phone crop); `PLACEHOLDERS.md` (generation record kept, the stock sections rewritten for the new set).
- **Config:** the `next.config.ts` placeholder guard, redirects and noindex header; `app/sitemap.ts`, `app/robots.ts`, `components/seo/json-ld.tsx`; `lib/text.ts`; `.env.example`.
- **Docs:** `docs/CLIENT-QUESTIONS.md`, same numbering, plus **Q33** (confirm the copy lifted from the WordPress build: About paragraph, services sub-line, Why-TDL cards). `docs/DESIGN-DECISIONS.md` starts fresh, with a pointer to v1's log for history.

**Tests and scripts (`scripts/`):**
- `verify.sh` (three tiers, Roster steps removed, the reveal test added) and `serve-and-run.sh`
- `first-load.mjs` (floor re-measured), `check-adapter.mjs` (boundary check, including the excerpt-verbatim rule)
- `scroll-proof.py`: slow and fling, 1280 and 390, fresh load and client-side navigation in both directions. Its Lenis on/off axis becomes motion on/off.
- `form-proof.{sh,py}`, `slider-proof.{sh,py}` (caption assertions inverted: **no** caption), `placeholder-guard-proof.sh`, `harden.py` (axe, keyboard, reduced motion, redirects, sitemap, JSON-LD)
- `masking-proof.py` and `posthog-stub.py` (canary), `consent-proof.py`, `provider-proof.mjs`, `android-probe.py`, Lighthouse runners and gate, `shot.py`, `trim-logos.mjs`, `ts-loader.mjs`
- **New:** `reveal-proof.py`. With JS disabled and with reduced motion, every section's text is visible at opacity 1 on load; with motion on, reveals fire once.

**Rules into AGENTS.md:** content integrity, imagery (including the slider-only generated exception), no AI attribution, plan first, testing tiers, performance and accessibility budgets. Done.

**Not ported:**
- The Roster (`components/roster/*`, `app/dev/roster`), GSAP, Lenis, `lib/lenis.ts`, `smooth-scroll.tsx`
- Archivo fonts, the old tokens, `home/*` section components (rebuilt in the WordPress style)
- Lifecycle and coverage graphics, the Roster proofs and LCP-trace scripts
- `posthog-setup.mjs` and `posthog-seed.mjs` (demo dashboard tooling). I'll port these if you want the PostHog demo again.

## 7. Components

- **Layout:** `SiteHeader` (sticky, mobile panel), `Logo`, `SiteFooter`, `Container`, `PageHeader` (inner-page band), `CtaBand`.
- **UI:** `ButtonPill` (pill + arrow, link or button), `PartnerCta`, `StaffLoginLink`, `Field` (form inputs), `Monogram`, `PhotoFrame` (TDL photo, demo image or brand-panel fallback; demo source gated server-side), `PauseButton`.
- **Motion:** `Reveal` (and `RevealGroup` for stagger), `TypedWords` (CSS per-character, SSR text, `aria-hidden` copy), `CountUp` (final value in the HTML), `HeroSlider`, `Carousel` (below `lg`), `LogoMarquee`.
- **Home sections:** `Hero`, `FiguresStrip`, `AboutBlock`, `QuotePanel`, `ServiceRows`, `Testimonials`, `ClientLogos`, `WhyTdl`.
- **Shared with pages:** `ServiceRow`, `FeatureCard` (the Why-TDL card style), `TestimonialCard`.

## 8. Build order (one conventional commit per step; Tier 1 every step, Tier 2 at the end of each feature and before any push)

1. `docs:` this plan, the audit and screenshots, AGENTS.md, CLIENT-QUESTIONS.md (+Q33). Committed as the first act of phase 2.
2. `chore: foundations`.
   - Dependencies: motion, lucide-react, react-hook-form, zod, qrcode, posthog-js; dev: axe-core, cross-env.
   - Fonts and tokens, `ensureStatic`, ported content, `next.config.ts` (guard, redirects, noindex).
   - Sitemap, robots, JSON-LD, `verify.sh` tiers. **Re-measure the first-load floor.**
3. `feat(layout):` sticky header with logo, nav, Paytrail link, WhatsApp CTA and mobile menu; footer. Port the scroll test, and see it fail first.
4. `feat(home):` hero, H1 typing and slider (demo images wired); slider test.
5. `feat(home):` figures, About, MD quote, services rows. Source and record the Pexels/Unsplash demo set.
6. `feat(home):` testimonials, logo marquee, Why TDL; the `Reveal` layer across the page and the reveal test. **Stop for review of the home page** at 1280 and 390 against `docs/reference/`.
7. `feat(services):` index and seven service pages from one template.
8. `feat(pages):` about-us, work, certifications, privacy, cookies, insights.
9. `feat(contact):` contact with the brochure QR and `/brochure`; become-a-client form and action; form test.
10. `feat(careers):` careers with the recruitment adapter and talent-pool form; provider test and boundary check.
11. `feat(analytics):` consent banner and PostHog, off by default; consent and canary masking tests. **Done 2026-10-25.**
12. Tier 3 in full; fix what it finds; report with first-load per route and Lighthouse.

The repo has no git remote yet, so "Tier 2 before every push" applies once one is added.
