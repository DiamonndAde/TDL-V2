#!/usr/bin/env bash
# npm run test:consent / test:masking — analytics only exists with a project key, so these build the site with one,
# pointed at scripts/posthog-stub.py on :3132 (nothing reaches PostHog), with replay always sampled so the canary has a
# replay stream to inspect. Then they put the SHIPPING build (no key) back. Exits non-zero if either proof failed.
#
#   bash scripts/analytics-proof.sh [consent|masking|both] [outdir]
set -u
cd "$(dirname "$0")/.."
export MSYS_NO_PATHCONV=1 PYTHONIOENCODING=utf-8
which="${1:-both}"
out="${2:-$(mktemp -d 2>/dev/null || echo "${TMPDIR:-/tmp}/tdl-analytics-$$")}"
mkdir -p "$out"
# Windows Python cannot open Git Bash's /tmp paths, so the Python side gets Windows paths.
winpath() { cygpath -w "$1" 2>/dev/null || echo "$1"; }
capture="$(winpath "$out/capture.bin")"
rm -f "$out/capture.bin"
# Empty, never unset: Next applies .env.local only to variables absent from the shell (scripts/verify.sh).
export PLACEHOLDER_IMAGES=false PLACEHOLDER_PRESENTATION_BUILD= NEXT_PUBLIC_SITE_URL= \
       NEXT_PUBLIC_ANALYTICS_SURVEYS= NEXT_PUBLIC_ANALYTICS_EXPERIMENTS=
export NEXT_PUBLIC_POSTHOG_KEY=phc_verify NEXT_PUBLIC_POSTHOG_HOST=http://127.0.0.1:3132 \
       NEXT_PUBLIC_ANALYTICS_REPLAY_SAMPLE=1 NEXT_PUBLIC_ANALYTICS_REPLAY_ENQUIRY=true
stop_servers() {
  powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { \$_.CommandLine -match 'next[^ ]* start' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1 || true
}
# PowerShell, not taskkill: with MSYS_NO_PATHCONV=1 exported, "taskkill //F" reaches Windows with the double slashes
# and fails silently, which left four stubs listening on 3132 (2026-10-25).
stop_stub() {
  powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3132 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id \$_ -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1 || true
}
log="$out/build.log"
stop_stub
python scripts/posthog-stub.py 3132 "$capture" >"$out/stub.log" 2>&1 &
sleep 1
if ! grep -q "posthog stub on 3132" "$out/stub.log"; then echo "the PostHog stub did not start:"; cat "$out/stub.log"; exit 1; fi
echo "analytics-on build (key → local stub)…"
stop_servers
rc=0
if npx next build >"$log" 2>&1; then
  if [ "$which" != masking ]; then bash scripts/serve-and-run.sh python scripts/consent-proof.py "$(winpath "$out")" || rc=1; fi
  if [ "$which" != consent ]; then bash scripts/serve-and-run.sh python scripts/masking-proof.py "$capture" || rc=1; fi
else
  tail -25 "$log"; rc=1
fi
stop_stub
echo "restoring the shipping build…"
export NEXT_PUBLIC_POSTHOG_KEY= NEXT_PUBLIC_POSTHOG_HOST= NEXT_PUBLIC_ANALYTICS_REPLAY_SAMPLE= NEXT_PUBLIC_ANALYTICS_REPLAY_ENQUIRY=
stop_servers
npx next build >"$log" 2>&1 || { tail -25 "$log"; exit 1; }
exit "$rc"
