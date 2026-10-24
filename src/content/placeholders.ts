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

/**
 * Stock demo photographs, keyed by frame. Empty since 2026-10-24: the two that passed every criterion (Unsplash
 * kwzWjTnDPLk, Pexels 30688591) were dropped from the page when the generated set arrived (owner's decision; cooler,
 * higher-contrast, and duplicating the technology and recruitment scenes). Their records stay in PLACEHOLDERS.md.
 */
export const stock: Partial<Record<DemoFrame, StockImage>> = {};

export type DemoFrame =
  | "about"
  | "why"
  | "service:human-resources-outsourcing"
  | "service:business-process-outsourcing"
  | "service:recruitment-background-check"
  | "service:learning-and-development"
  | "service:payroll-management"
  | "service:business-advisory"
  | "service:technology-solutions";

const FRAMES = "/placeholders/generated/frames";
/**
 * Generated demo images for the home frames (owner's extension of TDL's request, 2026-10-24): presentation builds
 * only, frames that name no person and claim no TDL premises, no caption. Made by scripts/generate-demo-images.mjs
 * (gpt-image-2, medium); prompt, checks and cost of each are in PLACEHOLDERS.md. Committed as WebP (quality 86).
 * A frame with a TDL photograph (photographs.ts) never shows one of these.
 */
export const frameImages: Partial<Record<DemoFrame, GeneratedImage>> = {
  about: { file: `${FRAMES}/gen-about.webp`, width: 1536, height: 1024, position: "50% 45%",
    scene: "a small team around a shared desk, one sketching a plan on a notepad" },
  "service:human-resources-outsourcing": { file: `${FRAMES}/gen-service-human-resources-outsourcing.webp`, width: 1536, height: 1024, position: "55% 50%",
    scene: "two HR officers going through employee folders, a colleague on the phone behind" },
  "service:business-process-outsourcing": { file: `${FRAMES}/gen-service-business-process-outsourcing.webp`, width: 1536, height: 1024, position: "55% 45%",
    scene: "back-office finance desks, a folder handed across a partition" },
  "service:recruitment-background-check": { file: `${FRAMES}/gen-service-recruitment-background-check.webp`, width: 1536, height: 1024, position: "50% 40%",
    scene: "a panel interview, two interviewers taking notes, the candidate in profile" },
  "service:learning-and-development": { file: `${FRAMES}/gen-service-learning-and-development.webp`, width: 1536, height: 1024, position: "50% 40%",
    scene: "a training session seen from the back of the room, a blank flip chart" },
  "service:payroll-management": { file: `${FRAMES}/gen-service-payroll-management.webp`, width: 1536, height: 1024, position: "50% 45%",
    scene: "two people checking a printed schedule beside a calculator" },
  "service:business-advisory": { file: `${FRAMES}/gen-service-business-advisory.webp`, width: 1536, height: 1024, position: "50% 40%",
    scene: "a consultant and two business owners at a round table" },
  "service:technology-solutions": { file: `${FRAMES}/gen-service-technology-solutions.webp`, width: 1536, height: 1024, position: "55% 45%",
    scene: "a software team at a monitor and a laptop" },
};

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
