"""Reveal test (Tier 2): the motion layer must never cost anyone the content (AGENTS.md, Motion).

  1. JavaScript off, 1280 and 390: every piece of text on the home page is fully visible, typed words whole,
     figures final. (WordPress hid animated content until its scripts ran, audit §5.)
  2. Reduced motion, JS on: everything visible at load without scrolling; nothing armed; no marquee movement;
     no pause controls.
  3. Motion on: content already on screen at load is never hidden; everything below the fold starts hidden and is
     fully visible once scrolled to; it stays visible (once per section); typed words end whole with no caret;
     counts end on the final figure.
  4. Auto-moving content: the logo marquee runs, pauses on hover and by its control; the testimonial carousel
     advances below lg, holds on Pause, and does not exist as a carousel at lg (three cards in one row).

Usage: python scripts/reveal-proof.py [base]   (the site must be running; exit 1 on any failure)
"""
import sys
from playwright.sync_api import sync_playwright

CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3131"
fails = []


def check(ok, msg):
    print(("  ok   " if ok else "  FAIL ") + msg)
    if not ok:
        fails.append(msg)


# Every text-bearing element in <main> whose own opacity, or an ancestor's, is below 1.
INVISIBLE = """() => {
  const out = [];
  for (const el of document.querySelectorAll('main h1, main h2, main h3, main p, main blockquote, main li, main img')) {
    if (el.closest('[aria-hidden="true"]') && !el.closest('.typed-words, .typed-headline')) continue;
    let o = 1, n = el;
    while (n && n !== document.body) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
    if (o < 0.99) out.push((el.tagName + ' ' + (el.textContent || el.alt || '').trim().slice(0, 40)).trim());
  }
  return out;
}"""
TYPED = "() => [...document.querySelectorAll('.typed-words .tc, .typed-headline .tc')].filter(c => getComputedStyle(c).opacity !== '1' || getComputedStyle(c).boxShadow !== 'none').length"
FIGURES = "() => [...document.querySelectorAll('section[aria-label*=figures] li p:first-of-type [aria-hidden=true]')].map(s => s.textContent)"
REVEALS = """() => [...document.querySelectorAll('[data-reveal]')].flatMap(r => {
  const items = r.querySelectorAll(':scope > li, [data-card]');
  const els = items.length ? [...items] : [r];
  // Effective opacity: the element's own times every ancestor's, so a hidden wrapper can't pass as visible items.
  return els.map(e => { const b = e.getBoundingClientRect(); let o = 1, n = e;
    while (n && n !== document.body) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
    return { top: b.top + scrollY, opacity: o > 0.99 ? "1" : o < 0.01 ? "0" : o.toFixed(2) }; });
})"""


def scroll_through(pg):
    h = pg.evaluate("document.documentElement.scrollHeight")
    for y in range(0, h, 250):
        pg.evaluate(f"window.scrollTo(0, {y})")
        pg.wait_for_timeout(120)
    pg.wait_for_timeout(1600)


with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)

    print("1. JavaScript off")
    for w, h in ((1280, 900), (390, 844)):
        ctx = b.new_context(viewport={"width": w, "height": h}, java_script_enabled=False)
        pg = ctx.new_page()
        pg.goto(BASE + "/")
        pg.wait_for_timeout(4800)  # the hero's CSS typing runs without JS; its last caret blinks until ~4.3 s
        bad = pg.evaluate(INVISIBLE)
        check(not bad, f"{w}px: all text visible without JS ({len(bad)} hidden: {bad[:4]})")
        check(pg.evaluate(TYPED) == 0, f"{w}px: typed words whole, no caret, without JS")
        check(pg.evaluate(FIGURES) == ["100+", "5,000+"], f"{w}px: figures final without JS ({pg.evaluate(FIGURES)})")
        ctx.close()

    print("2. Reduced motion")
    for w, h in ((1280, 900), (390, 844)):
        ctx = b.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce", is_mobile=w < 600, has_touch=w < 600)
        pg = ctx.new_page()
        pg.goto(BASE + "/")
        pg.wait_for_timeout(1500)
        hidden = [r for r in pg.evaluate(REVEALS) if r["opacity"] != "1"]
        check(not hidden, f"{w}px: nothing armed at load ({len(hidden)} hidden)")
        check(not pg.evaluate(INVISIBLE), f"{w}px: all text visible at load, no scrolling")
        check(pg.evaluate("document.querySelectorAll('.typed-words.is-armed, .typed-words.is-running').length") == 0, f"{w}px: typed words never armed")
        check(pg.evaluate(FIGURES) == ["100+", "5,000+"], f"{w}px: figures final")
        check(pg.evaluate("getComputedStyle(document.querySelector('.marquee-track')).animationName") == "none", f"{w}px: logo marquee does not move")
        visible_pauses = pg.evaluate("[...document.querySelectorAll('button[aria-label^=Pause]')].filter(b => b.offsetParent !== null).map(b => b.getAttribute('aria-label'))")
        check(not visible_pauses, f"{w}px: no pause controls ({visible_pauses})")
        ctx.close()

    print("3. Motion on")
    for w, h in ((1280, 900), (390, 844)):
        ctx = b.new_context(viewport={"width": w, "height": h}, is_mobile=w < 600, has_touch=w < 600)
        pg = ctx.new_page()
        pg.goto(BASE + "/")
        pg.wait_for_timeout(1500)
        at_load = pg.evaluate(REVEALS)
        above = [r for r in at_load if r["top"] < h]
        below = [r for r in at_load if r["top"] > h + 20]
        check(above and all(r["opacity"] == "1" for r in above), f"{w}px: content on screen at load is never hidden ({len(above)} items)")
        check(below and all(r["opacity"] == "0" for r in below), f"{w}px: below-the-fold content waits for its entrance ({sum(r['opacity'] == '0' for r in below)}/{len(below)} armed)")
        scroll_through(pg)
        after = pg.evaluate(REVEALS)
        check(all(r["opacity"] == "1" for r in after), f"{w}px: every section fully visible once scrolled to ({sum(r['opacity'] != '1' for r in after)} not)")
        pg.evaluate("window.scrollTo(0, 0)"); pg.wait_for_timeout(500)
        scroll_through(pg)
        check(all(r["opacity"] == "1" for r in pg.evaluate(REVEALS)), f"{w}px: entrances play once; nothing hides again on a second pass")
        check(pg.evaluate(TYPED) == 0, f"{w}px: typed words end whole with no caret")
        check(not pg.evaluate(INVISIBLE), f"{w}px: no text left invisible")
        check(pg.evaluate(FIGURES) == ["100+", "5,000+"], f"{w}px: counts end on the final figures ({pg.evaluate(FIGURES)})")
        ctx.close()

    print("4. Auto-moving content")
    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    pg = ctx.new_page()
    pg.goto(BASE + "/")
    marquee = pg.locator(".marquee")
    marquee.scroll_into_view_if_needed()
    pg.mouse.move(5, 5)
    pg.wait_for_timeout(300)
    state = lambda: pg.evaluate("getComputedStyle(document.querySelector('.marquee-track')).animationPlayState")
    check(pg.evaluate("getComputedStyle(document.querySelector('.marquee-track')).animationName") == "marquee" and state() == "running", "logo marquee runs")
    box = pg.locator(".marquee-viewport").bounding_box()
    pg.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
    pg.wait_for_timeout(200)
    check(state() == "paused", "marquee pauses while hovered")
    pg.mouse.move(5, 5)
    pg.get_by_role("button", name="Pause logo scroll").click()
    pg.mouse.move(5, 5)
    pg.evaluate("document.activeElement.blur()")
    pg.wait_for_timeout(200)
    check(state() == "paused" and pg.get_by_role("button", name="Play logo scroll").count() == 1, "marquee Pause control holds it")
    tops = pg.evaluate("[...document.querySelectorAll('[data-card]')].map(c => Math.round(c.getBoundingClientRect().top))")
    check(len(tops) == 3 and len(set(tops)) == 1, f"at lg, three testimonials in one row ({tops})")
    check(not pg.get_by_role("button", name="Next testimonial").is_visible(), "at lg, no carousel controls")
    ctx.close()

    ctx = b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.goto(BASE + "/")
    track = pg.locator("ul[aria-label='Client testimonials']")
    track.scroll_into_view_if_needed()
    pg.wait_for_timeout(500)
    counter = lambda: pg.locator("section[aria-labelledby=testimonials-title] p[aria-live]").inner_text().strip()
    c0 = counter()
    pg.wait_for_timeout(7000)
    c1 = counter()
    check(c0 == "1 / 3" and c1 == "2 / 3", f"below lg, the carousel advances after 6 s ({c0} -> {c1})")
    pg.get_by_role("button", name="Pause testimonials").tap()
    pg.evaluate("document.activeElement.blur()")
    c2 = counter()
    pg.wait_for_timeout(7000)
    check(counter() == c2, f"Pause holds the carousel ({c2} -> {counter()})")
    pg.get_by_role("button", name="Next testimonial").tap()
    pg.wait_for_timeout(900)
    check(counter() != c2, f"Next moves on ({c2} -> {counter()})")
    w = pg.evaluate("document.documentElement.scrollWidth")
    check(w <= 390, f"no horizontal page scroll at 390 ({w})")
    ctx.close()
    b.close()

print("\nFAILURES:", "none" if not fails else fails)
sys.exit(1 if fails else 0)
