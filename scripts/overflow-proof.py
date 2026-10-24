"""No horizontal overflow (Tier 2), with REAL scrollbars.

Headless Chromium passes --hide-scrollbars by default, so `100vw` (which includes a classic scrollbar) equals the
layout width in every other test, and a page ~8 px wider than its viewport passed them all. On Windows the deployed
site overflowed at 1280 and wider (scrollWidth 1273 vs clientWidth 1265, the About bleed's 100vw, 2026-10-24). This
launches Chromium without --hide-scrollbars and asserts scrollWidth === clientWidth on every route at 390, 1280 and
1920, after scrolling through each page so lazy content and entrances have settled.

Usage: python scripts/overflow-proof.py [base]   routes: OVERFLOW_ROUTES env, space-separated (default "/")
"""
import os, sys
from playwright.sync_api import sync_playwright

CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3131"
# Every built route, plus the 404 page, which is a page visitors land on too.
ROUTES = os.environ.get("OVERFLOW_ROUTES", "/").split() + ["/this-page-does-not-exist"]
fails = []

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME, ignore_default_args=["--hide-scrollbars"])
    probe = b.new_page(viewport={"width": 800, "height": 600})
    probe.set_content("<div style='height:3000px'></div>")
    bar = probe.evaluate("window.innerWidth - document.documentElement.clientWidth")
    probe.close()
    print(f"  classic scrollbar width in this browser: {bar}px")
    if bar <= 0:
        fails.append("scrollbars are hidden or overlay, so this test cannot see vw overflow")
        print("  FAIL scrollbars are hidden or overlay; the test would prove nothing")
    for w in (390, 1280, 1920):
        ctx = b.new_context(viewport={"width": w, "height": 900})
        pg = ctx.new_page()
        for route in ROUTES:
            pg.goto(BASE + route)
            pg.wait_for_load_state("load")
            h = pg.evaluate("document.documentElement.scrollHeight")
            for y in range(0, h, 400):
                pg.evaluate(f"window.scrollTo(0, {y})")
                pg.wait_for_timeout(60)
            pg.wait_for_timeout(700)
            sw, cw = pg.evaluate("[document.documentElement.scrollWidth, document.documentElement.clientWidth]")
            ok = sw == cw
            culprit = "" if ok else pg.evaluate("""cw => [...document.querySelectorAll('body *')]
                .filter(e => e.getBoundingClientRect().right > cw + 0.5)
                .filter(e => !e.closest('.marquee-viewport, [role=region][aria-roledescription=carousel], ul[aria-label="Client testimonials"]'))
                .slice(0, 3).map(e => e.tagName + '.' + String(e.className).slice(0, 70))""", cw)
            print(f"  {'ok  ' if ok else 'FAIL'} {w}px {route}: scrollWidth {sw}, clientWidth {cw}{'' if ok else f'  widest: {culprit}'}")
            if not ok:
                fails.append(f"{w}px {route}: {sw} > {cw}")
        ctx.close()
    b.close()

print("\nFAILURES:", "none" if not fails else fails)
sys.exit(1 if fails else 0)
