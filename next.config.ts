import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Demo imagery cannot ship by accident.
 *
 * One rule, evaluated the same way everywhere (local, Vercel preview, Vercel production):
 *   - PLACEHOLDER_IMAGES off  → nothing to check.
 *   - PLACEHOLDER_IMAGES on   → allowed when the build is not a production target, or when the presentation
 *                               marker PLACEHOLDER_PRESENTATION_BUILD is also set. Otherwise the build fails.
 * A production target is NODE_ENV=production unless VERCEL_ENV says this is a preview (Vercel previews run with
 * NODE_ENV=production; VERCEL_ENV is what tells a preview from the live deployment). Both variables are read
 * the same way: trimmed, quotes stripped, case-insensitive, "true"/"1"/"yes"/"on" all count as on.
 * The error prints every value it saw so the next failure diagnoses itself.
 */
const readEnv = (key: string) => (process.env[key] ?? "").trim().replace(/^["']|["']$/g, "");
const isOn = (value: string) => ["true", "1", "yes", "on"].includes(value.toLowerCase());
{
  const seen = {
    PLACEHOLDER_IMAGES: readEnv("PLACEHOLDER_IMAGES"),
    PLACEHOLDER_PRESENTATION_BUILD: readEnv("PLACEHOLDER_PRESENTATION_BUILD"),
    NODE_ENV: readEnv("NODE_ENV"),
    VERCEL_ENV: readEnv("VERCEL_ENV"),
    VERCEL: readEnv("VERCEL"),
  };
  const placeholders = isOn(seen.PLACEHOLDER_IMAGES);
  const presentation = isOn(seen.PLACEHOLDER_PRESENTATION_BUILD);
  const productionTarget = seen.NODE_ENV === "production" && seen.VERCEL_ENV !== "preview" && seen.VERCEL_ENV !== "development";
  if (placeholders && productionTarget && !presentation) {
    const report = Object.entries(seen)
      .map(([k, v]) => `${k}=${v === "" ? "(unset)" : JSON.stringify(v)}`)
      .join("  ");
    throw new Error(
      "Placeholder guard: PLACEHOLDER_IMAGES is on for a production target without the presentation marker. " +
        "Demo imagery must not ship. Either unset PLACEHOLDER_IMAGES, or set PLACEHOLDER_PRESENTATION_BUILD=1 " +
        "for a deliberate client presentation build (remove both before launch). " +
        `Values seen: ${report}`,
    );
  }
  if (placeholders && productionTarget && presentation) {
    // The marker unlocks a production target so a presentation can run on a Production deployment.
    // Make it impossible to scroll past.
    const line = "═".repeat(78);
    console.warn(
      [
        "",
        line,
        "  DEMO IMAGERY IS ON FOR A PRODUCTION TARGET",
        "",
        "  This build honours PLACEHOLDER_PRESENTATION_BUILD and renders demo images",
        "  (stock and the generated hero slider) on a production target.",
        `  VERCEL_ENV=${seen.VERCEL_ENV || "(unset)"}  NODE_ENV=${seen.NODE_ENV || "(unset)"}  VERCEL=${seen.VERCEL || "(unset)"}`,
        "",
        "  THIS MUST NOT BE THE LAUNCH BUILD.",
        "  Before going live, remove BOTH variables from the Vercel Production environment:",
        "      PLACEHOLDER_IMAGES",
        "      PLACEHOLDER_PRESENTATION_BUILD",
        "  and redeploy.",
        line,
        "",
      ].join("\n"),
    );
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Any *.vercel.app host is a demo or preview, never the site to index. Vercel adds its own noindex only to
  // Preview deployments, and a demo on a Production deployment would otherwise be indexable alongside
  // totaldatalimited.com. Host-matched, so the real domain is untouched.
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<sub>.+)\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  // Every URL that has existed is preserved or redirected (AGENTS.md, SEO). permanent → 308, otherwise 307.
  async redirects() {
    return [
      // From v1 and the original site.
      { source: "/new-client", destination: "/become-a-client", permanent: true },
      // The blog (TDL, 2026-10-26) replaces the /insights stub.
      { source: "/insights", destination: "/blog", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      // WordPress-era paths (docs/PLAN.md §2), in case anything was shared from the WordPress build.
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/career", destination: "/careers", permanent: true },
      { source: "/job-openings", destination: "/careers", permanent: true },
      { source: "/jobs", destination: "/careers", permanent: true },
      { source: "/contact", destination: "/contact-us", permanent: true },
      // The address the brochure QR code carries (/contact-us). Temporary (307), because where it points depends
      // on whether public/brochure.pdf exists (TODO(client): Q32). src/lib/brochure.ts reads the same file.
      {
        source: "/brochure",
        destination: existsSync(join(process.cwd(), "public", "brochure.pdf")) ? "/brochure.pdf" : "/services",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
