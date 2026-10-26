/**
 * The boundary check (Tier 1): static rules that must never regress silently. Ported from v1, plus the links
 * rule that the WordPress audit made necessary.
 *
 * LINKS (audit §7)
 *   No link points at "#", the theme vendor's demo site or wp-admin.
 *
 * BLOG SOURCE
 *   Nothing outside src/lib/blog imports src/content/blog: pages read posts through getPosts and getPost.
 *
 * CONTENT INTEGRITY
 *   Every testimonial excerpt is a verbatim substring of that person's full quote (never reworded, no typo
 *   "fixed" without Q22).
 *
 * RECRUITMENT (lands in docs/PLAN.md step 10)
 *   1. No file outside `src/lib/recruitment/` imports an adapter module, reads a provider's environment
 *      variables, or names a provider's exported symbols. Prose is not checked.
 *   2. Nothing on the recruitment path persists a candidate: no filesystem, no database client, no browser storage.
 *   3. The adapter entry point does not re-export an adapter wholesale.
 *
 * ANALYTICS (lands in docs/PLAN.md step 11)
 *   4. No visitor is ever identified, and `person_profiles` stays "never".
 *   5. Exception autocapture stays off (`capture_exceptions: false`).
 *   6. Session replay masks all inputs and all text.
 *   7. `track()` is never passed a template string as a property value in the form components.
 *
 * The recruitment and analytics sections print SKIPPED until their directories exist. Remove the skip when the
 * feature lands: a check that can skip forever is a check that proves nothing.
 *
 * Usage: node scripts/check-adapter.mjs   (exits 1 on failure)
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const ADAPTER_DIR = join("src", "lib", "recruitment");
const ANALYTICS_DIR = join("src", "lib", "analytics");
const failures = [];
const skipped = [];

/** Strip comments so prose never fails the check; keep string literals, since an import path is one. */
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function* files(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* files(full);
    else if (/\.(ts|tsx|mjs|js)$/.test(entry)) yield full;
  }
}

// ---------------------------------------------------------------- links
const DEAD_LINKS = [
  [/href=\{?["']#["']\}?/, 'a link to "#"'],
  [/href:\s*["']#["']/, 'a link to "#"'],
  [/animation-addons\.com/, "a link to the theme vendor's demo site"],
  [/wp-admin|wp-login/, "a link to WordPress admin"],
];
for (const full of files(join(root, "src"))) {
  const rel = relative(root, full);
  const code = stripComments(readFileSync(full, "utf8"));
  for (const [re, what] of DEAD_LINKS) {
    const line = code.split("\n").findIndex((l) => re.test(l));
    if (line !== -1) failures.push(`${rel}:${line + 1} has ${what} (audit §7: no dead or foreign links)`);
  }
}

// ---------------------------------------------------------------- blog source boundary
// Pages read posts only through src/lib/blog (getPosts, getPost), so a CMS can replace the local files without
// touching a page (docs/DESIGN-DECISIONS.md, 2026-10-26).
for (const full of files(join(root, "src"))) {
  const rel = relative(root, full);
  if (rel.startsWith(join("src", "lib", "blog") + sep) || rel.startsWith(join("src", "content", "blog") + sep)) continue;
  const code = stripComments(readFileSync(full, "utf8"));
  if (/from\s+["']@\/content\/blog/.test(code) || /from\s+["'][^"']*content\/blog/.test(code))
    failures.push(`${rel} imports the blog content files directly; read posts through src/lib/blog (getPosts, getPost)`);
}

// ---------------------------------------------------------------- content integrity: quotes
{
  const src = readFileSync(join(root, "src", "content", "testimonials.ts"), "utf8");
  // Each testimonial object starts at an `id:` line; take the text up to the next one.
  const starts = [...src.matchAll(/^\s*id:\s*"([a-z]+)",/gm)];
  const quoted = /"((?:[^"\\]|\\.)*)"/g;
  let checked = 0;
  for (const [i, m] of starts.entries()) {
    const block = src.slice(m.index, starts[i + 1]?.index ?? src.length);
    const id = m[1];
    const excerpt = block.match(/excerpt:\s*"((?:[^"\\]|\\.)*)"/)?.[1];
    const fullBlock = block.match(/full:\s*\[([\s\S]*?)\]/)?.[1];
    if (!excerpt || !fullBlock) continue;
    const full = [...fullBlock.matchAll(quoted)].map((q) => q[1]).join(" ");
    checked++;
    if (!full.includes(excerpt)) failures.push(`testimonial "${id}": the excerpt is not a verbatim sentence of the full quote — excerpts are never reworded`);
  }
  if (checked < 3) failures.push(`expected to check three testimonial excerpts, checked ${checked} — the content file's shape changed`);
}

// ---------------------------------------------------------------- recruitment boundary
const COUPLING = [
  [/from\s+["'][^"']*\/recruitment\/(zoho|webhook|none)["']/, "imports an adapter module directly"],
  [/from\s+["']\.\/(zoho|webhook|none)["']/, "imports an adapter module directly"],
  [/\bprocess\.env\.ZOHO_[A-Z_]+/, "reads a provider's environment variable"],
  [/\b(zohoRecruitProvider|zohoConfigured|webhookProvider|webhookConfigured|noneProvider)\b/, "names a provider's export"],
];
const STORAGE = [
  [/from\s+["']node:fs["']|require\(["']fs["']\)/, "filesystem access"],
  [/\bfrom\s+["'](prisma|@prisma\/client|drizzle-orm|mongoose|pg|mysql2|better-sqlite3|redis|@vercel\/kv)["']/, "a database or store client"],
  [/\b(localStorage|sessionStorage|indexedDB)\b/, "browser storage"],
];

if (!existsSync(join(root, ADAPTER_DIR))) {
  skipped.push(`recruitment boundary (${ADAPTER_DIR} not built yet — docs/PLAN.md step 10)`);
} else {
  for (const full of files(join(root, "src"))) {
    const rel = relative(root, full);
    const code = stripComments(readFileSync(full, "utf8"));
    const insideAdapter = rel.startsWith(ADAPTER_DIR + sep);
    if (!insideAdapter) {
      for (const [re, what] of COUPLING) {
        const line = code.split("\n").findIndex((l) => re.test(l));
        if (line !== -1) failures.push(`${rel}:${line + 1} ${what} — only ${ADAPTER_DIR} may`);
      }
    }
    if (insideAdapter || rel.includes(join("app", "careers")) || rel.includes(join("components", "careers"))) {
      for (const [re, what] of STORAGE) {
        if (re.test(code)) failures.push(`${rel} uses ${what}; the site must not store candidate data (src/lib/recruitment/types.ts)`);
      }
    }
  }
  const index = stripComments(readFileSync(join(root, ADAPTER_DIR, "index.ts"), "utf8"));
  if (/export\s+\*\s+from\s+["']\.\/(zoho|webhook|none)["']/.test(index)) {
    failures.push(`${ADAPTER_DIR}/index.ts re-exports an adapter wholesale; callers would bypass the interface`);
  }
}

// ---------------------------------------------------------------- analytics boundary
if (!existsSync(join(root, ANALYTICS_DIR))) {
  skipped.push(`analytics boundary (${ANALYTICS_DIR} not built yet — docs/PLAN.md step 11)`);
} else {
  // Any receiver, and optional chaining too: `client?.identify(...)` must fail this as surely as `posthog.identify(...)`.
  const IDENTIFY = /(?:\?\.|\.)\s*(identify|alias|setPersonProperties|setPersonPropertiesForFlags)\s*\(/;
  for (const full of files(join(root, "src"))) {
    if (!/\.(ts|tsx)$/.test(full)) continue;
    const m = stripComments(readFileSync(full, "utf8")).match(IDENTIFY);
    if (m) failures.push(`${relative(root, full)} calls ${m[1]}() — no visitor is ever identified (src/lib/analytics/index.ts)`);
  }
  const runtime = stripComments(readFileSync(join(root, ANALYTICS_DIR, "index.ts"), "utf8"));
  if (!/person_profiles:\s*["']never["']/.test(runtime)) failures.push(`${ANALYTICS_DIR}/index.ts must set person_profiles: "never"`);
  if (!/capture_exceptions:\s*false/.test(runtime))
    failures.push(`${ANALYTICS_DIR}/index.ts must set capture_exceptions: false — error messages can carry form values`);
  if (!/maskAllInputs:\s*true/.test(runtime) || !/maskTextSelector:\s*["']\*["']/.test(runtime))
    failures.push(`${ANALYTICS_DIR}/index.ts must mask all inputs and all text in session replay`);
  for (const file of ["src/components/careers/application-form.tsx", "src/components/enquiry/enquiry-form.tsx",
                      "src/components/careers/openings-link.tsx", "src/components/layout/page-viewed.tsx"]) {
    if (!existsSync(join(root, file))) { failures.push(`${file} is missing — the track() check cannot run`); continue; }
    const code = stripComments(readFileSync(join(root, file), "utf8"));
    for (const call of code.match(/track\(\{[^}]*\}\)/g) ?? []) {
      if (/`/.test(call)) failures.push(`${file} interpolates a template string into a track() property: ${call.slice(0, 80)}`);
    }
  }
}

for (const s of skipped) console.log(`  SKIPPED ${s}`);
if (failures.length) {
  console.error("Boundary check FAILED:\n" + failures.map((f) => "  " + f).join("\n"));
  process.exit(1);
}
const ran = ["no dead or foreign links", "blog posts only through src/lib/blog", "every quote excerpt is verbatim"];
if (existsSync(join(root, ADAPTER_DIR))) ran.push("nothing outside the adapter is wired to a provider", "no candidate data is stored");
if (existsSync(join(root, ANALYTICS_DIR))) ran.push("no visitor is identified", "analytics masking is in force");
console.log(`Boundaries ok: ${ran.join(", ")}.`);
