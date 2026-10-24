/**
 * Generated demo images for the home frames: presentation builds only (AGENTS.md, Imagery; the exception TDL asked
 * for, extended by the owner on 2026-10-24 to About, the seven service rows and Why TDL). v1's
 * scripts/generate-slider-images.mjs, ported: same model, size, base prompt, framing and equipment lines as v1's
 * re-runs, one scene per frame. Calls OpenAI's Images API directly; no SDK.
 *
 *   node scripts/generate-demo-images.mjs <max-images> [--budget 0.60] [--quality medium] [--only id,id] [--round N]
 *                                         [--env-file path]
 *
 * <max-images> and --budget are hard ceilings: a run that would exceed either (at the dearest cost seen so far, or
 * $0.045 an image before any) refuses and makes nothing, and a run stops as soon as the running total would pass the
 * budget. No retries, on purpose: every request costs money.
 *
 * The key is OPENAI_API_KEY from --env-file (default ./.env.local), read for this request only and never printed,
 * logged or written. Only that one variable is read. Output goes to photo-picks/generated/ (gitignored) with a manifest
 * of prompts, usage and cost; only optimised WebP of approved images is committed, under public/placeholders/.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const MODEL = "gpt-image-2";
const SIZE = "1536x1024";
// OpenAI pricing for gpt-image-2 standard as used in v1 (2026-10-17): text input $5.00 / 1M, image input $8.00 / 1M,
// image output $30.00 / 1M tokens. Cost is computed from each response's own usage, not estimated.
const PRICE = { textIn: 5 / 1e6, imageIn: 8 / 1e6, imageOut: 30 / 1e6 };
const PRE_ESTIMATE = 0.045; // per image, medium; v1 measured $0.0417–$0.0418

// Word for word v1's base prompt and its re-run framing and equipment lines (PLACEHOLDERS.md).
export const BASE_PROMPT =
  "Photorealistic candid photo of Nigerian professionals at work in a modern Lagos office, natural window light, " +
  "warm tones, people engaged in real tasks, nobody looking at the camera, no visible logos, no readable text on " +
  "screens or documents, landscape.";
const FRAMING =
  "Wide landscape composition with the people in the middle third of the frame; a full-bleed photograph with no " +
  "borders, bars or blank bands.";
const EQUIPMENT = "No lettering, logos or brand marks on any equipment, including the backs of monitors and laptop lids.";

/** One scene per frame, matched to what the frame is about. ids are the frame keys in src/content/placeholders.ts. */
export const SCENES = [
  { id: "about", scene: "A small team at work around a shared desk in an open office: one person sketching a plan on a notepad while two colleagues lean in to look, laptops open beside them." },
  { id: "service:human-resources-outsourcing", scene: "An HR team at work: two HR officers at adjacent desks going through employee folders together, one pointing at a page seen at an angle, a colleague on a phone call in the background." },
  { id: "service:business-process-outsourcing", scene: "Back-office finance work: an accounts team at a row of desks with calculators and box files, monitors turned away from the camera, one person handing a folder to another." },
  { id: "service:recruitment-background-check", scene: "A recruitment panel interview: two interviewers at a table listening and making notes, the candidate opposite in profile mid-answer, a CV lying flat and seen edge-on." },
  { id: "service:learning-and-development", scene: "A staff training session seen from the back of the room: a facilitator standing beside a blank flip chart addressing eight colleagues seated with notebooks." },
  { id: "service:payroll-management", scene: "A payroll team checking a month-end run: two people at one desk comparing a printed schedule seen edge-on, a calculator between them and a monitor turned away from the camera." },
  { id: "service:business-advisory", scene: "An advisory meeting: a senior consultant and two business owners around a small round table, one owner explaining with her hands, notebooks and coffee cups on the table." },
  { id: "service:technology-solutions", scene: "A software team at work: three developers at a long desk, two discussing something on a monitor angled away from the camera, the third typing on a laptop." },
  { id: "why", scene: "A client meeting at a conference table: a consultant walking two clients through a printed proposal held at an angle, everyone attentive, a window behind them." },
];

export const promptFor = (s) => `${BASE_PROMPT} Scene: ${s.scene} ${FRAMING} ${EQUIPMENT}`;
const fileId = (id) => id.replace(/^service:/, "service-");

function readKey(envFile) {
  const file = resolve(envFile);
  if (!existsSync(file)) throw new Error(`${envFile} not found`);
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.*)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, "").trim();
  }
  throw new Error(`OPENAI_API_KEY is not set in ${envFile}`);
}

function args(argv) {
  const out = { max: Number.NaN, budget: 0.6, quality: "medium", only: null, round: 1, envFile: ".env.local" };
  const rest = [...argv];
  out.max = Number(rest.shift());
  while (rest.length) {
    const a = rest.shift();
    if (a === "--budget") out.budget = Number(rest.shift());
    else if (a === "--quality") out.quality = rest.shift();
    else if (a === "--only") out.only = rest.shift().split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--round") out.round = Number(rest.shift());
    else if (a === "--env-file") out.envFile = rest.shift();
    else throw new Error(`unknown argument ${a}`);
  }
  if (!Number.isInteger(out.max) || out.max < 1) throw new Error("first argument must be the maximum number of images, e.g. 9");
  if (!(out.budget > 0)) throw new Error("--budget must be a positive number of US dollars");
  if (!["low", "medium", "high"].includes(out.quality)) throw new Error("--quality must be low, medium or high");
  return out;
}

async function main() {
  const opt = args(process.argv.slice(2));
  const scenes = opt.only ? SCENES.filter((s) => opt.only.includes(s.id)) : SCENES;
  if (opt.only && scenes.length !== opt.only.length) throw new Error("unknown scene id in --only");
  if (scenes.length > opt.max) {
    console.error(`Refusing: this run would make ${scenes.length} images and the limit is ${opt.max}. Nothing generated.`);
    process.exit(2);
  }
  if (scenes.length * PRE_ESTIMATE > opt.budget) {
    console.error(`Refusing: ${scenes.length} images at ~$${PRE_ESTIMATE} each could exceed the $${opt.budget} budget. Nothing generated.`);
    process.exit(2);
  }
  const key = readKey(opt.envFile);
  const dir = join(process.cwd(), "photo-picks", "generated");
  mkdirSync(dir, { recursive: true });
  const manifestPath = join(dir, "manifest.json");
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { images: [] };

  let runCost = 0;
  let dearest = PRE_ESTIMATE;
  for (const s of scenes) {
    if (runCost + dearest > opt.budget) {
      console.error(`STOPPED before ${s.id}: the next image could take the run past $${opt.budget} (spent $${runCost.toFixed(4)}).`);
      break;
    }
    const prompt = promptFor(s);
    const started = Date.now();
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt, size: SIZE, quality: opt.quality, n: 1, output_format: "png" }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`STOPPED on ${s.id}: HTTP ${res.status}: ${String(body?.error?.message ?? res.statusText)}`);
      process.exit(1);
    }
    const b64 = body?.data?.[0]?.b64_json;
    if (!b64) {
      console.error(`STOPPED on ${s.id}: no image in the response`);
      process.exit(1);
    }
    const file = `v2-r${opt.round}-${fileId(s.id)}-${opt.quality}.png`;
    writeFileSync(join(dir, file), Buffer.from(b64, "base64"));
    const u = body.usage ?? {};
    const textIn = u.input_tokens_details?.text_tokens ?? u.input_tokens ?? 0;
    const imageIn = u.input_tokens_details?.image_tokens ?? 0;
    const imageOut = u.output_tokens ?? 0;
    const cost = textIn * PRICE.textIn + imageIn * PRICE.imageIn + imageOut * PRICE.imageOut;
    runCost += cost;
    dearest = Math.max(dearest, cost);
    manifest.images.push({ file, id: s.id, round: opt.round, quality: opt.quality, model: MODEL, size: SIZE, prompt,
      usage: u, costUsd: Number(cost.toFixed(5)), seconds: Math.round((Date.now() - started) / 1000), at: new Date().toISOString() });
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`${file}  ${imageOut} output tokens  $${cost.toFixed(4)}  ${Math.round((Date.now() - started) / 1000)} s`);
  }
  const total = manifest.images.reduce((a, i) => a + (i.costUsd ?? 0), 0);
  console.log(`This run: $${runCost.toFixed(4)}. All v2 runs so far: ${manifest.images.length} images, $${total.toFixed(4)}.`);
}

main().catch((e) => {
  console.error(String(e?.message ?? e));
  process.exit(1);
});
