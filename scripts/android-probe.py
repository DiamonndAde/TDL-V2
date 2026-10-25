"""Throttled mid-range Android pass (AGENTS.md, performance). Applied throttling via CDP, not Lighthouse's
Lantern model: 4x CPU slowdown and slow 4G (150 ms RTT, 1.6 Mbps down), 412x823 at DPR 2 — a Moto G Power
profile. Reports FCP, LCP and its element, CLS and long tasks per route, then drives each interactive control
and reports the event→paint latency that INP is measured from.

Usage: bash scripts/serve-and-run.sh python scripts/android-probe.py [outdir]
"""
import json, sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3131"
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
OUT = sys.argv[1] if len(sys.argv) > 1 else None
RUNS = 3
ROUTES = ["/", "/services", "/services/payroll-management", "/about-us", "/careers", "/become-a-client", "/work", "/contact-us"]

INIT = """
window.__m = {lcp: 0, lcpEl: '', cls: 0, long: [], inp: 0, events: []};
new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__m.lcp = Math.round(e.startTime);
  window.__m.lcpEl = (e.element && (e.element.id || e.element.tagName + '.' + String(e.element.className).slice(0, 40))) || ''; } })
  .observe({type: 'largest-contentful-paint', buffered: true});
new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; })
  .observe({type: 'layout-shift', buffered: true});
new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.long.push(Math.round(e.duration)); })
  .observe({type: 'longtask', buffered: true});
// Only interactions count (interactionId > 0: click, tap, key), as INP defines it. Hover events share the frame but
// are not interactions; counting them failed /become-a-client on a pointerover (v2, 2026-10-25).
new PerformanceObserver(l => { for (const e of l.getEntries()) { if (!e.interactionId) continue; const d = Math.round(e.duration);
  window.__m.events.push([e.name, d]); if (d > window.__m.inp) window.__m.inp = d; } })
  .observe({type: 'event', durationThreshold: 16, buffered: true});
"""

fails = []


def check(ok, label, detail=""):
    print(("  ok   " if ok else "  FAIL ") + label + (f": {detail}" if detail else ""))
    if not ok:
        fails.append(label)


with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    ctx = b.new_context(viewport={"width": 412, "height": 823}, device_scale_factor=2, is_mobile=True, has_touch=True)
    ctx.add_init_script(INIT)
    pg = ctx.new_page()
    cdp = ctx.new_cdp_session(pg)

    def throttle():
        cdp.send("Network.emulateNetworkConditions", {"offline": False, "latency": 150,
                 "downloadThroughput": int(1.6 * 1024 * 1024 / 8), "uploadThroughput": int(750 * 1024 / 8)})
        cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})

    # Every load is cold, in a fresh context: a first visit on a metered phone is the case that matters, and reusing
    # one context made every route after the first look fast on cached framework chunks. Three runs per route, gated
    # on the median: single cold runs of the same build spread from 1.6 to 2.7 s on this machine (2026-10-25).
    print(f"Load, cold, {RUNS} runs each, 4x CPU + slow 4G, 412x823 DPR 2")
    loads = {}
    for route in ROUTES:
        runs = []
        for _ in range(RUNS):
            c = b.new_context(viewport={"width": 412, "height": 823}, device_scale_factor=2, is_mobile=True, has_touch=True)
            c.add_init_script(INIT)
            pp = c.new_page()
            cd = c.new_cdp_session(pp)
            cd.send("Network.emulateNetworkConditions", {"offline": False, "latency": 150,
                    "downloadThroughput": int(1.6 * 1024 * 1024 / 8), "uploadThroughput": int(750 * 1024 / 8)})
            cd.send("Emulation.setCPUThrottlingRate", {"rate": 4})
            pp.goto(BASE + route, wait_until="load")
            pp.wait_for_timeout(3500)
            m = pp.evaluate("window.__m")
            m["fcp"] = pp.evaluate("() => { const e = performance.getEntriesByName('first-contentful-paint')[0]; return e ? Math.round(e.startTime) : null; }")
            runs.append(m)
            c.close()
        runs.sort(key=lambda m: m["lcp"])
        med = runs[len(runs) // 2]
        loads[route] = {**med, "cls": max(m["cls"] for m in runs)}
        longsum = sum(d - 50 for d in med["long"] if d > 50)
        print(f"  {route:31} LCP median {med['lcp']:5} ms (runs {', '.join(str(m['lcp']) for m in runs)}; {med['lcpEl'][:30]})"
              f"  FCP {med['fcp']:5}  CLS max {loads[route]['cls']:.3f}  blocking {longsum} ms")
    print()
    for route, m in loads.items():
        check(m["lcp"] < 2500, f"{route} median LCP < 2.5 s", f"{m['lcp']} ms")
    for route, m in loads.items():
        check(m["cls"] < 0.1, f"{route} CLS < 0.1", f"{m['cls']:.3f}")

    print("\nInteraction latency (event duration; INP is the worst of these)")

    def interact(route, steps):
        """Each step: (label, locator, action). The control is scrolled into view and left to settle first, then
        tapped, as a phone user sees a control before touching it. Letting Playwright scroll inside the action
        billed its own scroll-and-wait to the event (4.2 s for one radio tap, while a page scroll of 500 px reached
        its next frame in 24 ms, 2026-10-25)."""
        # Three rounds, median per step, like the loads: one round of the same tap read 104 ms and then 208 ms on a
        # loaded machine (2026-10-25).
        samples = {label: [] for label, _, _ in steps}
        for _ in range(RUNS):
            throttle()
            pg.goto(BASE + route, wait_until="load")
            pg.wait_for_timeout(2500)  # settle after hydration, as a real visitor would
            for label, loc, action in steps:
                loc.scroll_into_view_if_needed()
                pg.wait_for_timeout(600)
                pg.evaluate("window.__m.inp = 0; window.__m.events = []")
                if action == "tap":
                    loc.tap()
                elif action == "check":
                    loc.check()
                elif action[0] == "fill":
                    loc.fill(action[1])
                elif action[0] == "select":
                    loc.select_option(index=action[1])
                pg.wait_for_timeout(600)
                samples[label].append(pg.evaluate("window.__m.inp"))
        med = {label: sorted(v)[len(v) // 2] for label, v in samples.items()}
        worst = max(med.values())
        check(worst < 200, f"{route} worst interaction (median of {RUNS}) < 200 ms",
              f"{worst} ms; " + ", ".join(f"{label} {med[label]} ({'/'.join(map(str, samples[label]))})" for label in med))

    # v2's home controls at phone width: the popover menu, the testimonial carousel and the logo marquee's pause.
    menu = lambda: pg.locator("button[popovertarget='site-menu']")
    interact("/", [
        ("open menu", menu(), "tap"),
        ("close menu", menu(), "tap"),
        ("next testimonial", pg.get_by_role("button", name="Next testimonial"), "tap"),
        ("previous testimonial", pg.get_by_role("button", name="Previous testimonial"), "tap"),
        ("pause logos", pg.get_by_role("button", name="Pause logo scroll"), "tap"),
    ])
    interact("/become-a-client", [
        ("service", pg.locator("#services input[type=checkbox]").first, "check"),
        ("headcount", pg.locator("#headcount input[type=radio]").first, "check"),
        ("continue", pg.get_by_role("button", name="Continue"), "tap"),
        ("type organisation", pg.locator("#organisation"), ("fill", "Test Ltd")),
        ("back", pg.get_by_role("button", name="Back", exact=True), "tap"),
    ])
    interact("/careers", [
        ("type name", pg.locator("#ap-name"), ("fill", "Ada")),
        ("choose area", pg.locator("#ap-area"), ("select", 1)),
        ("consent", pg.locator("input[type=checkbox]").last, "check"),
    ])

    # Scroll-fling: section reveals and typed words fire on the way past without a long task.
    print("\nScroll-fling (hero → footer in one gesture)")
    throttle()
    pg.goto(BASE + "/", wait_until="load")
    pg.wait_for_timeout(2500)
    pg.evaluate("window.__m.long = []")
    pg.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
    pg.wait_for_timeout(2500)
    m = pg.evaluate("window.__m")
    worst = max(m["long"], default=0)
    check(worst < 200, "longest task during a full-page fling < 200 ms", f"{worst} ms over {len(m['long'])} tasks")
    at_bottom = pg.evaluate("() => Math.abs(window.scrollY + innerHeight - document.body.scrollHeight) < 4")
    check(at_bottom, "page reaches the footer", "")
    if OUT:
        pg.screenshot(path=f"{OUT}/android-fling-footer.png")

    if OUT:
        throttle()
        pg.goto(BASE + "/", wait_until="load")
        pg.wait_for_timeout(2500)
        pg.screenshot(path=f"{OUT}/android-home-hero.png")
    b.close()

print("\nFAILURES:", ", ".join(fails) if fails else "none")
sys.exit(1 if fails else 0)
