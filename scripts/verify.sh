#!/usr/bin/env bash
# The testing policy in AGENTS.md, as one command per tier. Each tier includes the ones below it.
#
#   npm run check        Tier 1  lint, typecheck, boundary check
#   npm run verify       Tier 2  + production build, scroll regression, reveal test, first-load JS on every route
#   npm run verify:full  Tier 3  + everything else (see AGENTS.md)
#
# A test joins its tier in the same commit that creates it, so no tier ever lists a script that does not exist.
#
# Every step runs even if an earlier one failed (except where a later step needs the build), and the summary
# at the end lists each step with its result and time. Exits non-zero if anything failed.
#
# Leaves .next as the SHIPPING build (analytics off, demo imagery off) whatever tier ran, so `npm start`
# afterwards never serves a test configuration.

set -u
TIER="${1:-1}"
cd "$(dirname "$0")/.."

# Git Bash rewrites arguments that look like paths; "/" as a route would become "C:/Program Files/Git/".
export MSYS_NO_PATHCONV=1
export PYTHONIOENCODING=utf-8
# .env.local may turn demo imagery on for presentations; the build that gets verified is the shipping one.
export PLACEHOLDER_IMAGES=false
# Set to EMPTY, never unset: Next applies a .env.local value only when the variable is absent from the shell, and
# an empty string counts as present (v1 found the demo PostHog key leaking into "shipping" builds through unset).
export PLACEHOLDER_PRESENTATION_BUILD= NEXT_PUBLIC_POSTHOG_KEY= NEXT_PUBLIC_POSTHOG_HOST= \
       NEXT_PUBLIC_ANALYTICS_REPLAY_SAMPLE= NEXT_PUBLIC_ANALYTICS_REPLAY_ENQUIRY= NEXT_PUBLIC_ANALYTICS_SURVEYS= \
       NEXT_PUBLIC_ANALYTICS_EXPERIMENTS= NEXT_PUBLIC_SITE_URL=

WORK="$(mktemp -d 2>/dev/null || echo "${TMPDIR:-/tmp}/tdl-verify-$$")"
mkdir -p "$WORK"
# Routes that exist so far; grows with docs/PLAN.md §8.
ROUTES="/ /services /services/human-resources-outsourcing /services/payroll-management /services/technology-solutions /about-us /work /certifications /contact-us /become-a-client /careers /privacy-policy /cookies-policy /insights"
# The scroll test is the slowest step; one route per template is enough to catch a trap (2026-10-24: 7 min on 11 routes).
SCROLL_ROUTES="/ /services /services/payroll-management /about-us /work /contact-us /become-a-client /privacy-policy"
# Planned routes not built yet: the link check reports links to them as NOT YET instead of failing. Empty it as each lands.
PENDING_ROUTES=""
RESULTS=()
FAILED=0

kill_port() {
  powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort $1 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id \$_ -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1 || true
}

# step "<label>" <command...> — runs, records pass/fail and duration, prints the tail on failure.
step() {
  local label="$1"; shift
  local log="$WORK/$(echo "$label" | tr -c 'a-zA-Z0-9' '_').log"
  local start=$SECONDS
  printf '\n── %s\n' "$label"
  if "$@" >"$log" 2>&1; then
    local secs=$((SECONDS - start))
    RESULTS+=("ok    $(printf '%4ss' "$secs")  $label")
    grep -E "FAILURES:|NOT YET|crawled|Budget:|Boundaries ok|SKIPPED|ok  .*worst|gzip = floor|perf .*a11y" "$log" | tail -20 | sed 's/^/   /'
    return 0
  else
    local secs=$((SECONDS - start))
    RESULTS+=("FAIL  $(printf '%4ss' "$secs")  $label   (log: $log)")
    FAILED=1
    tail -25 "$log" | sed 's/^/   /'
    return 1
  fi
}

# Any `next start` left running keeps .next open on Windows, and a build over it can leave stale output
# (2026-10-24: stale CSS). Stop every one before building.
kill_next_servers() {
  powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { \$_.CommandLine -match 'next[^ ]* start' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1 || true
}

build() { kill_port 3131; kill_next_servers; npx next build; }

summary() {
  printf '\n════════ Tier %s summary ════════\n' "$TIER"
  for r in "${RESULTS[@]}"; do echo "  $r"; done
  if [ "$FAILED" -eq 0 ]; then echo "  RESULT: all passed"; else echo "  RESULT: FAILED"; fi
  echo "  logs: $WORK"
}

# ── Tier 1 ─────────────────────────────────────────────────────────────────────────────────────────────────
step "lint (0 errors)"        npx eslint
# Route types (PageProps<...>) are generated; a new route fails typecheck until they are.
step "typecheck"              bash -c "npx next typegen >/dev/null && npx tsc --noEmit"
step "boundary check"         node scripts/check-adapter.mjs

if [ "$TIER" -lt 2 ]; then summary; exit $FAILED; fi

# ── Tier 2 ─────────────────────────────────────────────────────────────────────────────────────────────────
if ! step "production build (shipping config)" build; then summary; exit 1; fi
step "scroll regression (+ header stays on screen)" \
      env SCROLL_ROUTES="$SCROLL_ROUTES" bash scripts/serve-and-run.sh python scripts/scroll-proof.py
step "reveal test: no JS, reduced motion, motion on (above the fold never hidden, entrances once), marquee, carousel" \
      bash scripts/serve-and-run.sh python scripts/reveal-proof.py
step "every link on every page returns 200 or a deliberate redirect (anchors included)" \
      env PENDING_ROUTES="$PENDING_ROUTES" bash scripts/serve-and-run.sh python scripts/link-proof.py
# Real scrollbars: headless Chromium hides them by default, which hid a 100vw overflow (2026-10-24).
step "no horizontal overflow with real scrollbars, every route at 390/1280/1920" \
      env OVERFLOW_ROUTES="$ROUTES" bash scripts/serve-and-run.sh python scripts/overflow-proof.py
kill_port 3131
# shellcheck disable=SC2086
step "first-load JS, every route" node scripts/first-load.mjs $ROUTES

if [ "$TIER" -lt 3 ]; then summary; exit $FAILED; fi

# ── Tier 3 ─────────────────────────────────────────────────────────────────────────────────────────────────
# On the shipping build from Tier 2, before anything below rebuilds.
step "harden: URLs and redirects, sitemap, robots, noindex, JSON-LD, unique titles, axe 15 routes x 1280/390, keyboard, reduced motion"       bash scripts/serve-and-run.sh python scripts/harden.py
step "throttled mobile (cold, median of 3): LCP, CLS, interaction latency, scroll-fling"       bash scripts/serve-and-run.sh python scripts/android-probe.py
# Git Bash by absolute path: a bare "bash" launched from Windows Python resolves to WSL's System32ash.exe, which
# ran nothing and printed "done" (2026-10-25).
GIT_BASH="$(cygpath -w "$BASH")"
LH_DIR="$(cygpath -m "$WORK")/lh"
step "Lighthouse, one route per template (only its own Chrome is killed between runs)"       bash scripts/serve-and-run.sh "$GIT_BASH" scripts/lh-clean.sh "$LH_DIR" simulate _ services services/payroll-management about-us work contact-us become-a-client careers privacy-policy
step "Lighthouse gate (a11y 100, CLS < 0.1; performance recorded, not gated)" node scripts/lighthouse-gate.mjs "$LH_DIR"
step "placeholder guard: refuses production, allows presentation and preview, no demo imagery in the shipping output" \
      bash scripts/placeholder-guard-proof.sh
step "enquiry form: validation, keyboard, delivery to a webhook stand-in, delivery failure, honeypot" \
      bash scripts/form-proof.sh "$WORK"
step "recruitment adapter: every branch against a stub (no credentials, no network)" \
      node --experimental-strip-types --no-warnings scripts/provider-proof.mjs
# Builds a presentation build of its own (the slider has nothing to show otherwise) and restores the shipping one.
step "hero slider: 6 s, crossfade, pause, hover/focus hold, Play override, keys, reduced motion, CLS, phone crop; typed H1; /brochure" \
      bash scripts/slider-proof.sh
# Builds with a key pointed at the local PostHog stand-in (replay always sampled) and restores the shipping build.
step "consent banner (CLS, LCP, equal weight, keyboard, screen reader, axe) and the canary masking test"       bash scripts/analytics-proof.sh both "$WORK"

summary
exit $FAILED
