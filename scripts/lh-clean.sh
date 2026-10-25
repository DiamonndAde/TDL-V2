#!/usr/bin/env bash
# Lighthouse, one route at a time, with any leftover Lighthouse Chrome killed before every run: headless instances
# leak on Windows and inflate TBT (v1, measurement hygiene). Usage:
#   bash scripts/serve-and-run.sh bash scripts/lh-clean.sh <outdir> <method: simulate|devtools> <route>...
# "_" is the home page.
#
# v1 killed every chrome.exe, which closes the owner's own browser. This runs Lighthouse on Playwright's Chromium
# (CHROME_PATH) and kills only processes started from that executable with a Lighthouse profile directory.
OUT="$1"; METHOD="$2"; shift 2
mkdir -p "$OUT"
export CHROME_PATH="${CHROME_PATH:-C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe}"
kill_lh_chrome() {
  powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { \$_.ExecutablePath -match 'ms-playwright' -and \$_.CommandLine -match 'lighthouse' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1 || true
}
for spec in "$@"; do
  route=$([ "$spec" = "_" ] && echo "" || echo "$spec")
  tag=$([ "$spec" = "_" ] && echo "home" || echo "$spec" | tr '/' '-')
  kill_lh_chrome
  npx --yes lighthouse@12 "http://localhost:3131/$route" --quiet --chrome-flags="--headless=new --no-sandbox" \
    --only-categories=performance,accessibility --form-factor=mobile --throttling-method="$METHOD" \
    --output=json --output-path="$OUT/clean-$METHOD-$tag.json" >"$OUT/lh-$tag.log" 2>&1
  echo "done $tag ($METHOD)"
done
kill_lh_chrome
