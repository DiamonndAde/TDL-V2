# WordPress site audit — totaldatalimited.free.je

Audited 2026-10-22 from the live site in headless Chromium (it passed the host's `?i=1` bot check), at 1280 px and 390 px. Facts below are measured from the rendered page, its computed styles, every loaded stylesheet and the WordPress REST API. They are not read off the screenshots.

**Screenshots** are in this folder: `home-1280-NN-<section>.png` and `home-390-NN-<section>.png`, one per section in page order. There are also `*-00-first-view-with-cookie-banner.png`, `*-90-viewport-scrolled-1600.png` (proves the header is not sticky), `*-99-full-page.png`, and `page-<slug>-1280-full.png` for the other pages. The cookie banner is hidden in the section shots.

**Stack:** WordPress, Astra theme (starter template), Elementor 4.2, plus these plugins: Animation Addons for Elementor (`wcf`), Premium Addons (typing text), Essential Addons, Header Footer Elementor, Sticky Header Effects, Sticky Menu or Anything, WP Job Openings, SureCookie, SureForms, Safelayout Cute Preloader, and WooCommerce leftovers. The home page alone makes 114 requests: 49 stylesheets, jQuery, React 18, Swiper, Typed.js and Font Awesome.

---

## 1. Pages that exist

**It is a one-page site.** The home page is the only page with real content. The header has eight menu items, and seven of them link to `#`.

| URL | State |
|---|---|
| `/` | The real page (Elementor, post 10) |
| `/about/` | Theme demo content, **lorem ipsum** |
| `/contact-us/`, `/career/`, `/services/`, `/blog/`, `/projects/`, `/log-in/`, `/register/` | Title only, empty |
| `/job-openings/` | WP Job Openings: "We currently have no job openings" |
| `/jobs/` | 404-style "can't find what you're looking for" |
| `/shop/`, `/shop-2/`, `/store/`, `/cart/`, `/checkout-2/`, `/my-account/`, `/8-2/`, `/9-2/` | WooCommerce leftovers (raw `[woocommerce_cart]` shortcodes, lorem) |
| `/sample-page/`, `/hello-world/` | WordPress defaults. The post exposes the admin username **"Olakunle"** and a demo comment |
| `wp-login.php` | Linked publicly from the header as "Log In" |

Nothing from these pages carries over except the home page. Our page set comes from the old repo (see `docs/PLAN.md`).

---

## 2. Home page, section by section (in order)

Container width is 1200 px (Elementor kit). Section padding is ~100 px top and bottom. Breakpoints are tablet 1024 and mobile 767.

### 2.0 Preloader and cookie banner (overlays)
- **Preloader:** Safelayout progress bar, `maxShowTime` 9 s, close button after 5 s. **Do not copy.**
- **Cookie banner:** SureCookie box, bottom-right, 650 px wide. Buttons: "Accept All / Only Essential / Preferences / Decline", plus "Powered by SureCookie". It shows even though the page loads no analytics. **Do not copy.** Our banner appears only when analytics is switched on (ported behaviour).

### 2.1 Header — `home-*-00-header.png`
- **Layout:** white bar, 104 px tall. Logo at left, menu centred, a second menu group right ("CAREER", "JOB OPENINGS"), then "Log In". It is `position:absolute` over the page and **scrolls away** (`home-1280-90-viewport-scrolled-1600.png`). The sticky plugins are installed but not configured.
- **Logo:** `logo-114x35.png`, shown at **114×35 px**. It is a green recolour of TDL's logo, and the tagline is unreadable at that size. alt="logo".
- **Menu:** Lato 11 px, weight 700, uppercase, navy `#0F172A`. The active item is green `#54B435`. Items: HOME, ABOUT, SERVICES, BLOG, PROJECTS, CONTACT, CAREER, JOB OPENINGS. **All link to `#` except HOME.** CAREER and JOB OPENINGS duplicate each other (TDL change 4).
- **Log In:** Lato 16 px, links to `wp-login.php`.
- **390 px:** logo at left (larger, ~95 px wide), green hamburger at right.

### 2.2 Hero — `home-*-01-hero.png`
- **Layout:** full-bleed background photo (`header-image.jpg`: four people shaking hands at sunset, city behind). Height 656 px at 1280, ~550 px at 390. Text block on the left at 600 px wide; no overlay tint.
- **Headline:** "Empower Your Workforce. **Scale Your** Business." It is an **H2**, and **the page has no H1**. Lato 42 px, weight 700, white. "Scale Your" is green and **typed** (Typed.js, 30 ms per character, with a blinking caret that stays after typing). The typed words are not in the HTML, so **crawlers and screen readers get "Empower Your Workforce. Business."**
- **Sub:** H5, Lato 18 px, weight 700, white: "Data-driven HR outsourcing, talent acquisition, and business process solutions tailored to propel your organization forward."
- **Button:** "Partner With Us", **links to `#`**. It is a green pill (text, 21×40 px padding) plus a separate 60 px green circle holding a Font Awesome arrow. On hover the arrow circle swaps sides (0.3 s).
- **390 px:** headline ~58 px, same stack, the button grows to full row height.

### 2.3 Figures strip — `home-*-02-stats-strip.png`
- **Layout:** white background, four columns at 1280 (each a 103 px icon over a bold label over a grey caption). They stack to one column at 390, with very large icons (~200 px).
- **Content:** "Certified / ISO 9001:2015", "**10+** / Years of Experience" (**wrong**: TDL was incorporated in 2000), "100+ / Happy Clients", "**4,000+** / Seconded Employees" (**inconsistent**: 5,000+ elsewhere).
- **Icons:** four **Gemini-generated PNG** cutouts (`Gemini_Generated_Image_*-removebg-preview.png`) in green, with alt text that is the filename. They use the Elementor "hang" hover animation (bob up and down, looping).

### 2.4 About — `home-*-03-about.png`
- **Layout:** two halves. Left: a thin vertical divider, heading, and paragraph (Lato 16 px, line-height 1.86, `#2F3B40`). Right: a full-height photo with the button overlapping its bottom-left corner.
- **Heading:** "About **TDL**" (H3, 43 px). "TDL" is green and typed. In one of three test loads it rendered **"About Global Brands"**: Premium Addons gives each typing widget a random id from `Math.random()*100`, so two widgets can collide and one types into the other.
- **Text:** "At Total Data Limited, we provide the groundwork for organizational success. By handling your core HR, administrative, and technological complexities, we allow your leadership team to focus on strategic growth."
- **Image:** `0b11a33329cfd245314aa9ff355b363e.jpg` (five young professionals in a hands-in huddle). **Hash filename, unknown origin.**
- **Button:** "Learn More", **links to `#`**, with the arrow circle on the left.

### 2.5 MD quote — `home-*-04-md-quote.png`
- **Layout:** light grey panel `#F4F4F4` with 8 px radius, full width. A large green "//" mark at top left; the quote is indented beneath it.
- **Quote:** H3, Lato 29 px, weight 700, navy: "Great talent isn't found; it's nurtured. Like a garden, it requires careful selection, patient cultivation, and the right environment to flourish. In the world of business, hiring exceptional individuals isn't a mere transaction; it's the essential groundwork for success."
- **Attribution:** right-aligned, 12 px. "Toluwalase Ayeni" in green, then " - Managing Director" typed. Note: the WordPress build spells it "Toluwalase"; the old site and repo keep "TOluwalase" (Q5, never silently change a name).

### 2.6–2.8 Core services — `home-*-05/06/07-services-*.png`
- **Layout:** dark grey background `#424242`, full width. Centred header: "TDL **Core** Services" (H3, 43 px, white, "Core" green and typed). Under it a sub-line in `#BDBDBD`: "End-to-end workforce and operational solutions engineered to drive efficiency, compliance, and sustainable organizational growth."
- **Six alternating rows.** Each row is a large photo (832 px wide) with a `#212121` text card (360 px) overlapping its inner edge. The card holds a white H3 at 26 px, a 1 px white rule that sticks out past the card edge, and body text in `#BDBDBD`. The image side alternates left and right. At 390 px the photo stacks above a full-width card.
- **Rows:** HR Outsourcing · Business Process Outsourcing · Recruitment & Background Screening · Learning & Development · Payroll Management · Business Advisory Services. **Technology Solutions (the 7th service line) is missing.** The cards have no links.
- **Images:** `iStock-1369691789-1.webp` (an **iStock** comp, licence unknown), `9570a740…jpg` (1024² and looks AI-generated), `3b838e8c…jpg`, `support-at-every-step.webp` (named after another company's page), `c3b9c630…jpg`, `38eb18ba…jpg`. All are **hash or foreign filenames of unknown origin.**

### 2.9 Testimonials — `home-*-08-testimonials.png`
- **Layout:** a panel with 16 px radius and a vertical gradient from green `#54B435` (at low opacity) to `#F2F3F5`. Across the top runs a giant outlined word, "Testimonial", in Space Grotesk 236 px with transparent fill and a grey stroke. It is a **continuous marquee** moving left at ~136 px/s. The repeated text "Testimonial Testimonial Testimonial" is in the accessibility tree.
- **Carousel:** Swiper, 2 cards per view at desktop and 1 at mobile. Autoplay every **3 s** with a 1.2 s ease slide, looping. **Touch swipe is disabled.** Pagination is a fraction ("02 — 03"); no arrows show.
- **Card:** white with 24 px radius. A 64 px client logo (removebg PNG), then the **full quote** in Space Grotesk 24 px / 38 px line-height, `#555`, followed by the name (Space Grotesk 20 px, weight 500) and the role and company (14 px grey). Cards run to ~1,900 px tall because the quotes are unabridged.
- **Content:** three testimonials (Dorothy Akpati, Transsnet Music; Chidi Okonkwo, Carlcare; and Chi Limited). The typos are verbatim: "personned", "conisttently", "hgh".

### 2.10 Trusted by — `home-*-09-trusted-by-logos.png`
- **Heading:** "Trusted by **Global Brands** & Market Leaders" (H3, 43 px, centred). "Trusted by" and "& Market Leaders" are green; "Global Brands" is navy and typed, with no caret.
- **Logos:** a Swiper grid of **two static rows by seven**. It does **not** move (sampled for 12 s; no autoplay). Logos are about 100 px wide, in full colour. Ten distinct logos fill 14 slots, so Carlcare, Boomplay, CHI, WASIL and itel each **appear twice**. Files are `image-removebg-preview-N.png` plus `0x0.png` (a 1383×846 file named like a press-site image).

### 2.11 Why Total Data Limited — `home-*-10-why-tdl.png`
- **Layout:** two columns. Left: a portrait crop of the hero photo (`header-image.jpg`) with 8 px radius. A **yellow `#FFDC4B`** badge sits over its bottom-left corner with a **counter** "10 +" over "Years of Experience" (Space Grotesk 56 px, counts 0 to 10 over 2 s at page load). Right: the heading "Why **Total Data** Limited?" ("Total Data" typed, green) and **two** white cards with a soft shadow.
- **Cards:** "Tailored Strategies": "Custom workforce solutions aligned with your precise operational goals". "**Ncompromised** Compliance" (typo): "ISO-certified processes guaranteeing full adherence to national data protection and labor regulations." Space Grotesk 20/16 px, centred. **Both link to `templates.animation-addons.com/handx-free/service-details/`**, the theme vendor's demo site.

### 2.12 Footer — `home-*-11-footer.png`
- A single line on `#212121`, 121 px tall: "Copyright © 2026 Total Data Limited. Powered by Total Data Limited." It has no address, phone, email, links, social links or legal pages.

---

## 3. Colours (verified)

From the Astra global palette (inline CSS) and the Elementor page CSS (`post-10.css`), cross-checked against computed styles:

| Role on the WordPress site | Value | Where |
|---|---|---|
| **Accent** | **`#54B435` green** (Astra `global-color-0`) | typed words, buttons, active nav, "//" quote mark, icons, testimonial gradient top |
| Accent dark | `#379237` (`global-color-1`) | hover |
| **Headings / navy** | **`#0F172A`** (`global-color-2`) ✔ | every heading, menu |
| Body text | `#2F3B40` (`global-color-3`) | paragraphs |
| Dark grounds | `#424242` section, `#212121` cards and footer | services, footer |
| Muted text on dark | `#BDBDBD` | service copy |
| Light panel | `#F4F4F4`, `#F2F3F5` | quote panel, testimonial gradient end |
| Badge | `#FFDC4B` yellow | Why-TDL counter |
| Testimonial text | `#555555`, `#26292E`, `#808286` | quote, name, role |

**Your read, checked:**
- **Navy `#0F172A`: confirmed.** It is the heading colour.
- **Olive `#7A7D59`: not in any stylesheet or inline style on the site.** The site's accent is the Astra starter-template green `#54B435`, and the WordPress logo was recoloured green to match it. Olive *is* TDL's real brand colour: the logo as supplied has an olive wordmark (sampled `#606135`), a cyan mark (`#54C4D0`), a lime arc (`#A4CE3C`) and a red tagline. `#7A7D59` sits in that olive family.
- **Peach `#E8BF96`: present, but only as the testimonial plugin's default.** It colours the Swiper pagination bullets and arrow hovers (`.wcf__testimonial`), which the page doesn't visibly use.

Contrast notes for whichever accent we use: `#7A7D59` on white is **4.3:1**, so it passes AA for large text and graphics but not for body-size text or 16 px button labels. `#606135` on white is 6.4:1. `#E8BF96` is 10.5:1 on navy and 5.9:1 on `#424242`.

## 4. Fonts (verified)

| Use | Face | Source |
|---|---|---|
| **All headings H1–H6, menu, body, buttons** | **Lato** 400 / 700 | Astra typography: `h1…h6 { font-family: Lato; font-weight: 700 }`, body `Lato 16px` |
| Testimonial quote, name, role; counter number; Why-TDL card titles and text; the outlined "Testimonial" word | **Space Grotesk** 400 / 500 / 700 | Elementor widget CSS only (11 rules) |
| Cookie banner | Figtree | plugin |
| Loaded but unused by visible content | Roboto, Roboto Slab | Elementor kit defaults |

**Your read, checked:** Lato body is confirmed. **Headings are Lato 700, not Space Grotesk.** Space Grotesk appears only inside the testimonial, counter and icon-box widgets. All fonts load at runtime from `fonts.googleapis.com` (four families, every weight and italic requested).

Type scale at 1280: H2 hero 42 px · section H3 43 px · quote 29 px · service H3 26 px · H5 18 px · body 16 px / 1.86 · menu 11 px uppercase.

---

## 5. Motion (measured)

### Smooth scrolling: **none.**
- No Lenis, no GSAP, no ScrollSmoother: no such script is loaded, and `window.gsap`, `window.Lenis` and `window.ScrollSmoother` are undefined.
- The animation plugin's own setting is explicitly off: `WCF_ADDONS_JS.smoothScroller: null`.
- The only scroll behaviour is Astra's `html { scroll-behavior: smooth }`.
- **So, per your rule: no Lenis.** We use CSS `scroll-behavior: smooth` for in-page anchors only (and not under `prefers-reduced-motion`). The old repo's scroll regression test still comes over, as a guard on the sticky header and anchor offsets.

### Scroll-triggered entrances (Elementor `animated` classes; default duration 1.25 s; triggered once on entering the viewport)
Elementor gives every animated element `visibility:hidden` (`.elementor-invisible`) until its JavaScript fires, so **with slow or failed JS the content never appears**. The 390 px BPO row shows a blank space where its card is still hidden.

| Section | What animates | How |
|---|---|---|
| Hero | Sub-line | `fadeIn`, 0.7 s delay, plus a "reveal from bottom" mask, 1 s |
| Hero | Button | `fadeIn` |
| Figures strip | The four items | **Tablet and mobile only:** `fadeInLeft`, `fadeIn`, `fadeIn`, `fadeInRight` (100% translate). Static on desktop |
| About | The whole section | `fadeIn` |
| MD quote | The whole section | `fadeInUp` (translate 100% of its own height) |
| MD quote | The quote text | `tada` (an attention-seeker wiggle and scale) |
| Services | Sub-line | `fadeIn` |
| Services | Each row | `fadeIn` |
| Services | Each text card | `zoomInDown` (from scale 0.1, 1000 px above) |
| Trusted by, Why TDL, Footer | (nothing) | — |

### Typing (Premium Addons + Typed.js)
Six typed accent words: "Scale Your", "TDL", " - Managing Director", "Core", "Global Brands", "Total Data". All type at 30 ms per character with a blinking caret (none on "Global Brands"), and do not loop. **All six start at page load (`data-start-effect="page_load"`), not when scrolled into view,** so everything below the hero has finished typing before anyone sees it.

### Counter
The Why-TDL badge counts 0 to 10 over 2 s, **at page load** (jquery-numerator). It is the only counter.

### Carousels and marquees
- **Testimonial carousel:** Swiper autoplay 3 s, 1.2 s ease slide, loop, 2-up and 1-up, fraction pagination, touch disabled, **no pause control.**
- **"Testimonial" outlined word:** continuous linear marquee at ~136 px/s, **no pause control.**
- **Client logos:** static. **There is no logo marquee on the WordPress site.**

### Hover
- Buttons: the arrow circle swaps sides, 0.3 s.
- Figure icons: "hang" (vertical bob, looping while hovered).
- Menu: Astra "slide-up" submenu animation (no submenus exist).

### Reduced motion
Nothing honours `prefers-reduced-motion`: typing, counter, carousel and marquee all run regardless.

---

## 6. Why it reads as "straight to the point" (what we keep)

1. **One page, one scroll, one message per section.** Hero, then the figures, who we are, the MD's belief, what we do, who says so, who we work for, and why us. No section needs a second read.
2. **A plain hero.** A real-looking photo, a short headline, one sentence, one button. No abstract concept to decode.
3. **Proof up front.** ISO, years, clients and staff sit directly under the hero as four icon-plus-figure items.
4. **Services as big picture-and-card rows.** Each service gets a photograph, a name and one paragraph, so a visitor skims the whole offer in seconds.
5. **Familiar patterns.** Pill buttons with an arrow, a logo wall, testimonial cards, a "Why us" pair. Nothing to learn.
6. **A restrained palette and one type family for the reading.** White and light grey grounds, one dark band for services, a single accent colour on the words that matter (the typed accent word in each heading).
7. **Generous spacing.** 100 px section padding, a 1200 px container, large headings.
8. **Motion that announces sections rather than performs.** Fades, the occasional typed word, a slow carousel.

## 7. Problems we must not copy

**Links**
- "Tailored Strategies" and "Ncompromised Compliance" link to the theme vendor's demo site, `templates.animation-addons.com/handx-free/service-details/`.
- "Partner With Us", "Learn More" and seven of eight menu items link to `#`.
- A public "Log In" link to `wp-login.php`. The `/hello-world/` post also exposes the admin username.

**Copy and facts**
- "**Ncompromised**" (for "Uncompromised").
- "10+ Years of Experience" twice (strip and badge). TDL was incorporated in **2000**, so we use "since 2000" (Q2, old repo `facts.ts`).
- "4,000+ Seconded Employees", against 5,000+ elsewhere, so we use **5,000+** (Q1).
- Testimonial typos "personned", "conisttently", "hgh". These are verbatim in the client's quote. We **never silently edit an attributed quote** (Q22). Change 9 sidesteps them on the home page: each card shows one verbatim sentence, and none of the chosen sentences contains a typo. The full quote page keeps them until Q22 is answered.
- "Toluwalase" spelling differs from the old site's "TOluwalase" (Q5, keep and flag).
- Technology Solutions is missing from the services.
- Duplicated logos in the client wall.

**Structure and accessibility**
- **No H1.** The headline is an H2, and its typed words are missing from the HTML.
- A **114×35 px logo**, recoloured green, with an unreadable tagline. TDL asked for their full logo at a readable size (change 3).
- The header is not sticky (change 2). CAREER and JOB OPENINGS duplicate each other (change 4).
- Alt text is filenames ("gemini generated image k9e58fk9e58fk9e5…", "0x0"). The decorative marquee word is read aloud.
- Content is hidden until JS runs. No reduced-motion handling. Auto-moving content has no pause control (WCAG 2.2.2). Carousel swipe is disabled on phones.
- The typing-widget id collision can put the wrong words in a heading.

**Imagery (unknown origin, none of it is reused)**
- `iStock-1369691789-1.webp`: an iStock comp, no evidence of a licence.
- Hash filenames (`0b11a333…`, `9570a740…`, `3b838e8c…`, `c3b9c630…`, `38eb18ba…`): typical of images saved from Pinterest or Google Images.
- `support-at-every-step.webp`: named after another site's section. `header-image.jpg`, `0x0.png`, `jane-smith.png`: unknown origin.
- Figure icons: four Gemini-generated PNGs.
- Client logos: `removebg-preview` cutouts. We use the old repo's trimmed set instead (still pending SVGs, Q17).

**Performance and privacy**
- 114 requests, 49 stylesheets, jQuery plus React plus Swiper plus Typed.js, and Font Awesome for two arrows.
- Google Fonts fetched at runtime, with every weight and italic of four families.
- A preloader that can hold the page for up to 9 s.
- A cookie banner with no analytics behind it.

---

## 8. What this means for the rebuild (summary; the detail is in `docs/PLAN.md`)

- Keep the section order and layouts in §2, the type scale in §4 and the colour *roles* in §3.
- Replace every WordPress image, icon and link. Apply TDL's nine changes.
- Recreate the motion in §5 with `motion`, but quicker (0.4–0.6 s, 12–24 px offsets instead of 100%), triggered when in view rather than at load, never hiding content without JS, and absent under reduced motion. Drop the attention-seekers (`tada`, `zoomInDown`, the icon "hang").
- No smooth-scroll library.
