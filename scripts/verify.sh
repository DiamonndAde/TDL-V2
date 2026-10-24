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
ROUTES="/ /services /services/human-resources-outsourcing /services/payroll-management /services/technology-solutions"
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
    grep -E "FAILURES:|NOT YET|Budget:|Boundaries ok|SKIPPED|ok  .*worst|gzip = floor|perf .*a11y" "$log" | tail -20 | sed 's/^/   /'
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
      env SCROLL_ROUTES="$ROUTES" bash scripts/serve-and-run.sh python scripts/scroll-proof.py
step "reveal test: no JS, reduced motion, motion on (above the fold never hidden, entrances once), marquee, carousel" \
      bash scripts/serve-and-run.sh python scripts/reveal-proof.py
# Real scrollbars: headless Chromium hides them by default, which hid a 100vw overflow (2026-10-24).
step "no horizontal overflow with real scrollbars, every route at 390/1280/1920" \
      env OVERFLOW_ROUTES="$ROUTES" bash scripts/serve-and-run.sh python scripts/overflow-proof.py
kill_port 3131
# shellcheck disable=SC2086
step "first-load JS, every route" node scripts/first-load.mjs $ROUTES

if [ "$TIER" -lt 3 ]; then summary; exit $FAILED; fi

# ── Tier 3 ─────────────────────────────────────────────────────────────────────────────────────────────────
step "placeholder guard: refuses production, allows presentation and preview, no demo imagery in the shipping output" \
      bash scripts/placeholder-guard-proof.sh
# Builds a presentation build of its own (the slider has nothing to show otherwise) and restores the shipping one.
step "hero slider: 6 s, crossfade, pause, hover/focus hold, Play override, keys, reduced motion, CLS, phone crop; typed H1; /brochure" \
      bash scripts/slider-proof.sh

summary
exit $FAILED
