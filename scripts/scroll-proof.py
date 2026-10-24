"""Scroll regression test (Tier 2), ported from v1. Every route must scroll top to bottom with real wheel events, slow
and fling, at 1280 and 390, with motion on and with reduced motion, including after client-side navigation in both
directions. v2 has no smooth-scroll library, but the test stays: it guards anything that could trap or clamp the
page (a fixed overlay, an overflow rule, a stale height) and, new in v2, TDL change 2: the header is still on
screen after scrolling to the bottom. Exit 1 on any failure.

   python scripts/scroll-proof.py [base]          routes: SCROLL_ROUTES env, space-separated (default "/")
"""
import os, sys, urllib.request
from playwright.sync_api import sync_playwright

CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3131"
ROUTES = os.environ.get("SCROLL_ROUTES", "/").split()
# Client-side navigation pairs: (start, link label, expected path). The dangerous direction is arriving at the LONG
# page (home) from a SHORT one. A pair runs once both routes exist.
NAV_PAIRS = [
    ("/", "Services", "/services"),
    ("/services", "home", "/"),
    ("/become-a-client", "home", "/"),
]
failures = []


def exists(path):
    try:
        return urllib.request.urlopen(base + path, timeout=10).status == 200
    except Exception:
        return False


def max_scroll(pg):
    return pg.evaluate("document.documentElement.scrollHeight - window.innerHeight")


def wheel_to_bottom(pg, step, pause):
    """Real wheel events. Stops when scrollY stops moving for 6 ticks."""
    stuck, last = 0, -1
    for _ in range(400):
        pg.mouse.wheel(0, step)
        pg.wait_for_timeout(pause)
        y = pg.evaluate("window.scrollY")
        if abs(y - last) < 1:
            stuck += 1
            if stuck >= 6:
                break
        else:
            stuck = 0
        last = y
    pg.wait_for_timeout(600)
    return pg.evaluate("window.scrollY")


def check(pg, label):
    footer_visible = pg.evaluate("document.querySelector('footer').getBoundingClientRect().top < window.innerHeight")
    header_top = pg.evaluate("document.querySelector('header').getBoundingClientRect().top")
    y = pg.evaluate("window.scrollY")
    mx = max_scroll(pg)
    ok = footer_visible and y >= mx - 4 and abs(header_top) < 1
    print(f"  {'ok  ' if ok else 'FAIL'} {label}: scrollY {y:.0f} of {mx:.0f}, footer visible {footer_visible}, header top {header_top:.0f}")
    if not ok:
        failures.append(label)


def run(b, width, height, dpr, reduced, pairs):
    ctx = b.new_context(viewport={"width": width, "height": height}, device_scale_factor=dpr, is_mobile=width < 640,
                        has_touch=width < 640, reduced_motion="reduce" if reduced else "no-preference")
    pg = ctx.new_page()
    mode = f"{width}px motion={'reduced' if reduced else 'on'}"
    for route in ROUTES:
        for step, pause, speed in ((120, 30, "slow"), (900, 8, "fling")):
            pg.goto(base + route); pg.wait_for_load_state("load"); pg.wait_for_timeout(1000)
            pg.mouse.move(width // 2, height // 2)
            wheel_to_bottom(pg, step, pause)
            check(pg, f"{mode} {route} fresh load, {speed}")

    def go(label):
        if width < 1024:
            pg.get_by_role("button", name="Menu").click(); pg.wait_for_timeout(200)
        if label == "home":
            pg.locator("header a[aria-label='Total Data Limited, home']").click()
        else:
            pg.locator("header a:visible", has_text=label).first.click()

    for start, label, expect in pairs:
        tag = f"{expect} after arriving from {start}"
        pg.goto(base + start); pg.wait_for_load_state("load"); pg.wait_for_timeout(1000)
        go(label); pg.wait_for_url(f"**{expect}" if expect != "/" else base + "/"); pg.wait_for_timeout(1200)
        pg.mouse.move(width // 2, height // 2)
        wheel_to_bottom(pg, 120, 30); check(pg, f"{mode} {tag}, slow")
        pg.evaluate("window.scrollTo(0, 0)"); pg.wait_for_timeout(400)
        wheel_to_bottom(pg, 900, 8); check(pg, f"{mode} {tag}, fling")
        pg.evaluate("window.scrollTo(0, 0)"); pg.wait_for_timeout(300)
        pg.keyboard.press("End"); pg.wait_for_timeout(1500); check(pg, f"{mode} {tag}, End key")
    ctx.close()


pairs = [p for p in NAV_PAIRS if exists(p[0]) and exists(p[2])]
missing = [p for p in NAV_PAIRS if p not in pairs]
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME, args=["--headless=new"])
    for reduced in (False, True):
        run(b, 1280, 900, 1, reduced, pairs)
        run(b, 390, 844, 2, reduced, pairs)
    b.close()
for start, _, expect in missing:
    print(f"  NOT YET navigation {start} -> {expect}: a route does not exist yet (docs/PLAN.md §8)")
print("\nFAILURES:", failures or "none")
sys.exit(1 if failures else 0)
