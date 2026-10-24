/**
 * Demo imagery for client presentations ONLY. Rendered when PLACEHOLDER_IMAGES is on; the build guard in
 * next.config.ts refuses that on a production target without the presentation marker. Shipping builds never
 * read this file's images: frames without a TDL photograph fall back to a brand panel (<PhotoFrame>).
 *
 * v2 rules (AGENTS.md, Imagery):
 *  - No visible label, credit or caption on the page. Source, photographer, licence and URL live here and in
 *    PLACEHOLDERS.md.
 *  - Stock is Pexels or Unsplash licensed: Nigerian professionals at work, natural light, no legible logos or
 *    documents, never in a frame that names a person or claims TDL's own office or staff.
 *  - Generated images: only the six client-approved slider images below, only in the home hero slider.
 */
export interface StockImage {
  file: string;
  width: number;
  height: number;
  scene: string;
  /** CSS object-position for the frame's crop. */
  position?: string;
  photographer: string;
  photographerUrl: string;
  sourceUrl: string;
  licence: "Pexels" | "Unsplash";
}

/** Keyed by frame. Filled as frames are built (step 5); a frame with no entry shows its brand panel. */
export const stock: Partial<Record<StockFrame, StockImage>> = {};

export type StockFrame =
  | "about"
  | "why"
  | "service:human-resources-outsourcing"
  | "service:business-process-outsourcing"
  | "service:recruitment-background-check"
  | "service:learning-and-development"
  | "service:payroll-management"
  | "service:business-advisory"
  | "service:technology-solutions";

/**
 * AI-generated images for the home hero slider: the one client-approved exception to "never generated imagery"
 * (TDL, 2026-10-17; owner approved these six 2026-10-22). Made with gpt-image-2 by v1's
 * scripts/generate-slider-images.mjs; prompts, selection and spend are in PLACEHOLDERS.md. Since 2026-10-24 they
 * carry no caption (owner's instruction). `position` is the CSS object-position: the hero crops them wide on
 * desktop and portrait on phones, so x matters most on phones.
 */
export interface GeneratedImage {
  file: string;
  width: number;
  height: number;
  scene: string;
  position: string;
  phone?: { file: string; width: number; height: number; position?: string };
}

const GEN = "/placeholders/generated";
/** In slide order. */
export const sliderImages: GeneratedImage[] = [
  { file: `${GEN}/gen-meeting-standup.webp`, width: 1536, height: 1024, position: "60% 40%",
    scene: "three colleagues by a window going through a folder together" },
  // Phone: a 1300x975 crop from the left, so the walking figure at the right edge is out of frame rather than halved.
  { file: `${GEN}/gen-admin-open-plan.webp`, width: 1536, height: 1024, position: "40% 45%",
    scene: "two people working at facing desks in an open-plan office",
    phone: { file: `${GEN}/gen-admin-open-plan-phone.webp`, width: 1300, height: 975 } },
  // Painted letterbox bars trimmed off (rows 147-876 kept of 1024).
  { file: `${GEN}/gen-laptop-pair.webp`, width: 1536, height: 730, position: "50% 50%",
    scene: "two colleagues side by side at one laptop" },
  // Painted letterbox bars trimmed off (rows 118-907 kept of 1024).
  { file: `${GEN}/gen-documents-records.webp`, width: 1536, height: 790, position: "55% 40%",
    scene: "a man filing a folder into a shelf of box files" },
  { file: `${GEN}/gen-hr-interview.webp`, width: 1536, height: 1024, position: "45% 25%",
    scene: "an interview across a desk, the interviewer taking notes" },
  { file: `${GEN}/gen-payroll-desk.webp`, width: 1536, height: 1024, position: "35% 8%",
    scene: "a woman checking figures on a printed sheet with a calculator" },
];

/** Read at build/prerender time in server components. Off by default. */
export const placeholdersEnabled = process.env.PLACEHOLDER_IMAGES === "true";
