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
| (sourced in docs/PLAN.md step 5) | | | | | |

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
