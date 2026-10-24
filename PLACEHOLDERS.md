# Demo imagery — presentations only

Shipping builds show TDL's own photographs, real client logos and the TDL logo, and nothing else. A frame with no TDL photograph falls back to a designed brand panel (`<PhotoFrame>`). For client presentations, `PLACEHOLDER_IMAGES=true` fills the frames with the demo images recorded here.

**No demo image carries a visible label, credit or caption on the page** (owner, 2026-10-24). This file is where the sources, photographers and licences are recorded instead.

## It cannot ship by accident

- The default is off. `PLACEHOLDER_IMAGES` is unset or `false` in every environment unless someone sets it for a demo.
- `next.config.ts` applies one rule everywhere: locally, on a Vercel preview, and on a Vercel production deployment.
  - With `PLACEHOLDER_IMAGES` on, a **production target** (`NODE_ENV=production` and `VERCEL_ENV` not `preview`) builds only if `PLACEHOLDER_PRESENTATION_BUILD` is also set.
  - Otherwise the build **fails**, and the error prints every value it saw.
  - A Vercel **preview** needs only `PLACEHOLDER_IMAGES`.
- When a production target does build with both set, the log carries a boxed "DEMO IMAGERY IS ON FOR A PRODUCTION TARGET" warning. **Before launch, remove both variables from the Vercel Production environment.**
- `npm run test:guard` proves the rule under eight environments. It also proves that the shipping build's HTML and RSC output contain no `/placeholders/` file and no `data-demo` marker.
- Named-person frames (testimonial executives, leadership, board) never show a stock or generated face; they show an initials monogram. No demo image ever sits in a frame captioned as TDL's own office, address or staff.

## Stock photographs (`stock` in `src/content/placeholders.ts`)

Pexels or Unsplash licence (free to use, attribution not required; recorded here anyway). Criteria, carried over from v1:
- A Nigerian workplace, with the location stated on the source page.
- Real people mid-work, natural light where possible.
- No legible brand logo or document; nothing captioned as TDL's own; no named person.
- The same style as the WordPress site's photos.

| Frame | File | Scene | Photographer | Source | Licence |
|---|---|---|---|---|---|
| `about` (home, About TDL) | `stock/unsplash-kwzWjTnDPLk.jpg` 1800×1200 | Two colleagues working through code at a laptop, more desks behind; "Coding together @ NESA by Makers", Lagos, Nigeria | [X (@disruptxn)](https://unsplash.com/@disruptxn) | [unsplash.com/photos/kwzWjTnDPLk](https://unsplash.com/photos/man-using-black-laptop-computer-kwzWjTnDPLk) | Unsplash License (free; checked 2026-10-24, not Unsplash+) |
| `why` (home, Why TDL) | `stock/pexels-30688591.jpg` 1800×1200 | An interview across a desk in a modern office, the interviewer in the foreground; Lagos, Lagos, Nigeria | [Ninthgrid](https://www.pexels.com/@ninthgrid-2149521550/) | [pexels.com/photo/30688591](https://www.pexels.com/photo/professional-interview-in-modern-lagos-office-30688591/) | Pexels licence (free) |

Both were checked at full size: no logo on any device, screens unreadable, no document legible.

**The seven service rows have no demo photograph, in any build.** Only two candidates passed every criterion. Rather than show two photographs among five brand panels, which reads as gaps, all seven rows show their brand panel (navy, the logo's lime arc, the service's icon) until TDL's photographs arrive. Relaxing a criterion (for example, accepting African office photographs without a stated Nigerian location) would fill them; that is the owner's call.

### Sourced and rejected (2026-10-24)

- **Device logos** (Apple on laptop lids, unless a crop removes them): Ninthgrid 30677592, 30678213, 30678875, 30688588, 30688597, 30690398; a Dell logo on 34690055. Plus every v1 rejection for the same reason (v1's list below).
- **Signage** ("Café One", "GREAT COFFEE"): Ninthgrid 30677596, 30677598, 30689323, 30690400, 30690405.
- **Posed, not at work:** 30688595 and 30688914 (group and fist bump); Taiye Salawu 34690054–34690063 (portrait series).
- **Branded clothing:** 33176041 (team T-shirts with a logo).
- **Legible screen and brand:** Taiye Salawu 36482981 (v1's `desk-work`). At full size the laptop shows a readable slide ("MARKET INSIGHT · Health & Beauty Day") and a "MacBook Pro" wordmark. v1 judged it at thumbnail size.
- **No location stated on the source page:** Oladipupo Ajisegiri 1405769 and Oluwapamilerinayo Ajala 30970394, both used in v1; their pages no longer state one.
- **Paid licence:** Ben Iwara's Lagos series on Unsplash (XRe8KaTs6YU, MBf1ehMmV3A, rQbchGgEw9E, I5Ozz_OuJXA and the silhouette set) is Unsplash+, not free.

## AI-generated images for the frames (exception extended 2026-10-24)

The home page showed ten identical navy panels in demo builds, and TDL chose the WordPress site partly because it is photo-led. TDL had asked for generated images for the demo, so the owner extended the slider exception on 2026-10-24. Generated images are now allowed in every demo frame that names no person and claims no TDL premises: **About, the seven service rows and Why TDL**, in presentation builds only, with no caption.

Generation: `scripts/generate-demo-images.mjs` (v1's script, ported), `gpt-image-2`, quality `medium`, 1536×1024. Capped at 9 images and $0.60, with the same base prompt and the same framing and equipment lines as v1's re-runs. There is one scene per frame, matched to its content. The images, checks and spend are recorded below once generated. **Not wired in until the owner approves the contact sheet.** The two stock photographs stay only if they still fit next to the generated set.

## AI-generated images for the home hero slider (`sliderImages`)

**AI-generated with OpenAI `gpt-image-2`** (Images API, 1536×1024, quality `medium`) by v1's `scripts/generate-slider-images.mjs` (in `../tdl-website`; not ported). **Client-approved exception**: TDL asked on 2026-10-17 for generated images in the slider until their own photographs arrive (Q27); the owner approved the six below on 2026-10-22. They appear **only in presentation builds** (`PLACEHOLDER_IMAGES`, behind the build guard), **only in the home slider** (in v2, the hero background), and **since 2026-10-24 with no caption** (owner's instruction: no visible labels, credits or captions on demo imagery). They never sit in a frame that names a person or claims TDL's premises (AGENTS.md, Placeholders rules 1–3). Committed as WebP (quality 86); the PNG originals and the generation manifest stay in the gitignored `photo-picks/generated/`.

**Base prompt**, word for word in every image:

> Photorealistic candid photo of Nigerian professionals at work in a modern Lagos office, natural window light, warm tones, people engaged in real tasks, nobody looking at the camera, no visible logos, no readable text on screens or documents, landscape.

followed by `Scene: <scene>` and a framing line — round 1: "Keep the people and the main action in the middle horizontal band of the frame, with plain space above and below, so a very wide crop still shows them." — re-run: "Wide landscape composition with the people in the middle third of the frame; a full-bleed photograph with no borders, bars or blank bands. No lettering, logos or brand marks on any equipment, including the backs of monitors and laptop lids."

| Slide | File | Scene line | Framing | Processing |
|---|---|---|---|---|
| 1 | `generated/gen-meeting-standup.webp` 1536×1024 | Three colleagues standing by a window in a short working discussion, one holding a folder, another pointing at it. | round 1 | as generated |
| 2 | `generated/gen-admin-open-plan.webp` 1536×1024, phone `gen-admin-open-plan-phone.webp` 1300×975 | An open-plan administration office: two people at adjacent desks working on computers, a third walking past carrying files, slightly out of focus. | round 1 | phone source is a crop from the left (x 0–1300, y 25–1000), so the walking figure is out of frame rather than halved |
| 3 | `generated/gen-laptop-pair.webp` 1536×730 | Two colleagues side by side at one laptop, one explaining something on the screen to the other, screen angled away from the camera. | round 1 | painted letterbox bars trimmed (rows 147–876 kept) |
| 4 | `generated/gen-documents-records.webp` 1536×790 | A man filing folders into a shelf of labelled box files in a records room, labels blank or out of focus. | round 1 | painted letterbox bars trimmed (rows 118–907 kept) |
| 5 | `generated/gen-hr-interview.webp` 1536×1024 | An HR interview across a desk: the interviewer listening and taking notes, the candidate in profile mid-answer. | re-run | as generated |
| 6 | `generated/gen-payroll-desk.webp` 1536×1024 | A payroll officer at an admin desk with a calculator and a monitor turned away from the camera, checking figures on a printed sheet seen edge-on. | re-run | as generated |

**Checked at full size** before selection: hands, faces including background people, any text or logos, distortion. **Rejected**: round 1 `meeting-table`, `documents-review`, `hr-interview`, `laptop-pair`, `documents-records` came back with flat letterbox bars painted in (the round-1 framing line, taken literally; the last two were rescued by trimming), `documents-review` also had a logo-like mark on a background laptop lid, and `payroll-desk` had brand-like lettering on a monitor back — both re-run with the new framing and equipment lines and passed.

**Sharpness**: the desktop band shows ~1,920 device px across on a 2× laptop against 1,536 source px — slightly soft, accepted for the demo. On phones (358 CSS px, 716 device px at 2×, 1,074 at 3×) every image has at least 1,074 px except `laptop-pair` (973) and `documents-records` (1,053), which are 9% and 2% short on 3× phones only. Nothing was upscaled.

**Spend**: 10 images generated, **$0.4175** in total ($0.0417–$0.0418 each: 113 text-input tokens at $5/M and 1,372 image-output tokens at $30/M, from each response's own usage).

Faces are fine in the slider: it names no one and claims no premises. The face rule is about frames carrying a named person; the premises rule is about frames captioned with TDL's address.

## Running a presentation build

```
PLACEHOLDER_IMAGES=true PLACEHOLDER_PRESENTATION_BUILD=1 npm run build && npm start
```

On Vercel: set `PLACEHOLDER_IMAGES=true` on the **Preview** environment (nothing else is needed). On Production, set both `PLACEHOLDER_IMAGES=true` and `PLACEHOLDER_PRESENTATION_BUILD=1` for the presentation, and remove both afterwards.

## Removing the mechanism for good

Delete the demo entries in `src/content/placeholders.ts`, the demo branch in `<PhotoFrame>` and the hero slider, the guard block in `next.config.ts`, `public/placeholders/`, and this file.
