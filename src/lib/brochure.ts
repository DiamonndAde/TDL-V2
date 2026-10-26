import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { company } from "@/content/facts";
import { isDemoBuild } from "./build-mode";

/**
 * The brochure (TDL review, 2026-10-16, item 7). /brochure is the stable address the printed QR code carries; the
 * redirect in next.config.ts sends it to /brochure.pdf once that file is in public/, and to /services until then
 * (TODO(client): Q32). Dropping the PDF in is the whole swap: this flag and the redirect both read the same file.
 */
const brochureFile = join(process.cwd(), "public", "brochure.pdf");
export const brochureReady = existsSync(brochureFile);

/** "1.3 MB", read from the file at build time, so the download buttons always state the real size (metered data). */
export const brochureSize = brochureReady ? `${(statSync(brochureFile).size / 1_000_000).toFixed(1)} MB` : "";

/**
 * What the QR code encodes. The real domain by default, so a code printed from any shipping build keeps working
 * for as long as the domain does. A demo build encodes the demo's own address instead, so it can be scanned in a
 * meeting. The page carries no demo note (owner, 2026-10-25); the rule is in HANDOFF.md and PLACEHOLDERS.md: never
 * print a QR from a demo build, because a printed demo code dies with the demo deployment.
 */
export function brochureQrTarget(): { url: string; demo: boolean } {
  if (!isDemoBuild) return { url: `${company.siteUrl}/brochure`, demo: false };
  const host = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const base = host ? (host.startsWith("http") ? host : `https://${host}`) : "http://localhost:3000";
  return { url: `${base.replace(/\/$/, "")}/brochure`, demo: true };
}
