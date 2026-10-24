#!/usr/bin/env bash
# npm run test:slider — the hero slider, which only has images to show in a presentation build until TDL's
# photographs arrive. Builds that configuration, runs scripts/slider-proof.py against it, then puts the SHIPPING
# build back so nothing afterwards serves demo imagery. Exits non-zero if the proof failed.
set -u
cd "$(dirname "$0")/.."
export MSYS_NO_PATHCONV=1 PYTHONIOENCODING=utf-8
# Empty, never unset: Next applies .env.local only to variables absent from the shell (scripts/verify.sh).
export NEXT_PUBLIC_POSTHOG_KEY= NEXT_PUBLIC_POSTHOG_HOST= NEXT_PUBLIC_SITE_URL=
export PLACEHOLDER_IMAGES=true PLACEHOLDER_PRESENTATION_BUILD=1
stop_servers() {
  powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { \$_.CommandLine -match 'next[^ ]* start' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1 || true
}
log="$(mktemp 2>/dev/null || echo "${TMPDIR:-/tmp}/slider-build-$$.log")"
echo "presentation build…"
stop_servers
if ! npx next build >"$log" 2>&1; then tail -25 "$log"; exit 1; fi
bash scripts/serve-and-run.sh python scripts/slider-proof.py "$@"
rc=${PIPESTATUS[0]}
echo "restoring the shipping build…"
export PLACEHOLDER_IMAGES=false PLACEHOLDER_PRESENTATION_BUILD=
stop_servers
npx next build >"$log" 2>&1 || { tail -25 "$log"; exit 1; }
exit "$rc"
