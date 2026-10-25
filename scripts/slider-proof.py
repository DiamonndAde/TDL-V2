"""
Home hero slider proof (TDL change 8; D4), against a PRESENTATION build on :3131. Until TDL's photographs arrive the
slider only renders demo images, so `npm run test:slider` builds that configuration and restores the shipping build
afterwards. Ported from v1 and adapted to v2: the slider is the hero background, crossfades over 0.8 s, and its demo
images carry NO caption, label or credit (owner, 2026-10-24).

Asserts every bound on auto-moving content (AGENTS.md, Motion): 6 s per image after first paint, crossfade not slide,
pause control visible and effective, hover and focus hold it, Play works with the pointer on it, indicators and arrow
keys, nothing auto-advances and no pause control under reduced motion, CLS, the phone crop. Also the typed H1 (full
sentence in the accessible text; reduced motion shows it at once with no caret) and /brochure.

Usage: python scripts/slider-proof.py [screenshot-dir]
"""
import re, sys, urllib.request, urllib.error
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else None
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
BASE = "http://localhost:3131"
HERO = "section[aria-labelledby=hero-title]"
SLIDES = f"{HERO} [aria-roledescription=slide]"
HEADLINE = "We run the HR. You run the business."
fails = []


def check(ok, msg):
    print(("ok    " if ok else "FAIL  ") + msg)
    if not ok:
        fails.append(msg)


def current(page):
    """1-based index of the image shown, read from the indicator that carries aria-current."""
    return page.evaluate(f"""() => {{ const b = [...document.querySelectorAll('{HERO} button[aria-label^="Show image"]')];
        return b.findIndex(x => x.getAttribute('aria-current') === 'true') + 1; }}""")


def away(page):
    """Pointer off the hero (on the header) and focus out of it."""
    page.mouse.move(640, 20)
    page.evaluate("document.activeElement && document.activeElement.blur()")


with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)

    # ---- desktop, motion allowed
    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    page.add_init_script("""window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries()) if(!e.hadRecentInput) window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});""")
    page.goto(BASE + "/", wait_until="networkidle")
    away(page)
    check(page.locator(f"{HERO} [role=region][aria-roledescription=carousel]").count() == 1, "slider rendered as the hero background in a demo build")
    N = page.locator(SLIDES).count()
    check(N >= 4, f"four or more images ({N})")
    first = page.evaluate(f"() => {{ const i = document.querySelector('{SLIDES} img'); return [i.currentSrc, i.getAttribute('fetchpriority'), i.getAttribute('loading')] }}")
    check("gen-" in first[0] and first[1] == "high" and first[2] == "eager", f"first image is a generated demo image, eager, high fetch priority ({first[0][-50:]}, {first[1]}, {first[2]})")
    check(page.locator(f"{HERO} [data-demo]").count() == 1, "demo frame carries data-demo (the guard test looks for it)")
    text = page.locator(HERO).inner_text().lower()
    check(not any(w in text for w in ("stand-in", "generated", "placeholder", "photo:", "credit")), "no caption, label or credit on the demo images")
    loaded = page.evaluate(f"() => [...document.querySelectorAll('{SLIDES}')].map(s => !!s.querySelector('img'))")
    check(loaded[-1] is False, f"images load as needed, not all at once ({loaded})")
    h1 = page.evaluate("() => { const h = document.querySelector('h1'); return [document.querySelectorAll('h1').length, h.querySelector('.sr-only').textContent] }")
    check(h1[0] == 1 and h1[1] == HEADLINE, f"one H1, full headline in its accessible text ({h1})")
    OUT and page.screenshot(path=f"{OUT}/slider-1280.png")

    c0 = current(page)
    page.wait_for_timeout(6900)
    c1 = current(page)
    check(c0 == 1 and c1 == 2, f"auto-advances after 6 s ({c0} -> {c1})")
    fade = page.evaluate(f"() => [...document.querySelectorAll('{SLIDES}')].slice(0, 2).map(s => [getComputedStyle(s).opacity, getComputedStyle(s).transitionProperty, getComputedStyle(s).transitionDuration])")
    check(fade[1][0] == "1" and fade[0][0] == "0" and fade[1][1] == "opacity" and fade[1][2] == "0.8s", f"crossfade, not a slide ({fade})")
    img_ok = page.evaluate(f"() => {{ const im = document.querySelectorAll('{SLIDES}')[1].querySelector('img'); return !!im && im.complete && im.naturalWidth > 0 }}")
    check(img_ok, "second image loaded by the time it shows")

    # hover holds
    hero_box = page.locator(HERO).bounding_box()
    page.mouse.move(hero_box["x"] + hero_box["width"] * 0.75, hero_box["y"] + hero_box["height"] / 2)
    page.wait_for_timeout(7000)
    check(current(page) == c1, f"hover holds ({current(page)})")
    away(page)
    page.wait_for_timeout(6900)
    c2 = current(page)
    check(c2 == 3, f"resumes after hover leaves ({c2})")

    # focus holds
    page.locator(f'{HERO} button[aria-label="Show image 1 of {N}"]').focus()
    page.keyboard.press("Tab")  # keyboard move onto the next indicator; nothing clicked
    page.wait_for_timeout(7000)
    check(current(page) == c2, f"focus inside holds ({current(page)})")
    away(page)

    # pause control
    pause = page.get_by_role("button", name="Pause slideshow")
    check(pause.count() == 1 and pause.is_visible(), "visible pause control")
    pb = pause.bounding_box()
    check(pb["x"] > hero_box["x"] + hero_box["width"] / 2 and pb["y"] + pb["height"] <= hero_box["y"] + hero_box["height"] and pb["width"] >= 44,
          f"pause control bottom right of the hero, at least 44 px ({pb})")
    pause.click()
    away(page)
    c3 = current(page)
    page.wait_for_timeout(7000)
    check(current(page) == c3, f"Pause holds ({c3} -> {current(page)})")
    play = page.get_by_role("button", name="Play slideshow")
    check(play.count() == 1, "control becomes Play")
    play.click()  # pointer and focus now on the control: Play must still start it
    page.wait_for_timeout(6900)
    check(current(page) != c3, f"Play runs even with pointer and focus on the control ({c3} -> {current(page)})")

    # indicators and keys
    page.locator(f'{HERO} button[aria-label="Show image {N} of {N}"]').click()
    check(current(page) == N, f"an indicator jumps to its image ({current(page)})")
    page.keyboard.press("ArrowRight")
    check(current(page) == 1, f"ArrowRight wraps from the last to the first ({current(page)})")
    page.keyboard.press("ArrowLeft")
    check(current(page) == N, f"ArrowLeft wraps back ({current(page)})")
    cls = page.evaluate("window.__cls")
    check(cls < 0.1, f"CLS {cls:.4f}")
    ctx.close()

    # ---- reduced motion
    ctx = b.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="reduce")
    page = ctx.new_page()
    page.goto(BASE + "/", wait_until="networkidle")
    away(page)
    typed = page.evaluate("() => [...document.querySelectorAll('.typed-headline .tc')].map(c => [getComputedStyle(c).opacity, getComputedStyle(c).boxShadow])")
    check(all(o == "1" and s == "none" for o, s in typed), "reduced motion: the headline is there at once, no caret")
    page.evaluate(f"""() => {{ window.__moves = 0; new MutationObserver(m => {{ window.__moves += m.filter(r => r.target.getAttribute('aria-current') === 'true').length; }})
        .observe(document.querySelector('{HERO}'), {{subtree: true, attributes: true, attributeFilter: ['aria-current']}}); }}""")
    page.wait_for_timeout(7500)
    moves = page.evaluate("() => window.__moves")
    check(current(page) == 1 and moves == 0, f"no auto-advance under reduced motion (image {current(page)}, {moves} changes in 7.5 s)")
    check(not page.get_by_role("button", name="Pause slideshow").is_visible(), "no pause control under reduced motion")
    page.locator(f'{HERO} button[aria-label="Show image 2 of {N}"]').click()
    page.keyboard.press("ArrowRight")
    check(current(page) == 3, f"indicators and keys still work under reduced motion ({current(page)})")
    # Tailwind's motion-reduce:transition-none sets transition-property: none (the duration stays declared).
    t = page.evaluate(f"() => {{ const s = getComputedStyle(document.querySelector('{SLIDES}')); return [s.transitionProperty, s.transitionDuration] }}")
    check(t[0] == "none" or t[1] == "0s", f"image change is instant under reduced motion ({t})")
    ctx.close()

    # ---- phone
    ctx = b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
    page = ctx.new_page()
    page.goto(BASE + "/", wait_until="networkidle")
    page.wait_for_timeout(500)
    OUT and page.screenshot(path=f"{OUT}/slider-390.png")
    w = page.evaluate("document.documentElement.scrollWidth")
    check(w <= 390, f"no horizontal page scroll at 390 ({w})")
    page.locator(f'{HERO} button[aria-label="Show image 2 of {N}"]').tap()
    page.wait_for_timeout(1500)
    src = page.evaluate(f"() => document.querySelectorAll('{SLIDES}')[1].querySelector('img')?.currentSrc ?? ''")
    check("phone" in src, f"a slide with its own phone crop serves it on a phone ({src[-60:]})")
    ctx.close()

    # ---- the brochure QR on /contact-us (change 7): present and labelled with its target. A demo build shows no demo
    # note on the page (owner, 2026-10-25); the do-not-print rule lives in HANDOFF.md and PLACEHOLDERS.md.
    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    page.goto(BASE + "/contact-us", wait_until="networkidle")
    qr = page.locator("[role=img][aria-label^='QR code for']")
    label = qr.get_attribute("aria-label") if qr.count() else ""
    check(qr.count() == 1 and label.endswith("/brochure"), f"QR on /contact-us encodes /brochure ({label})")
    check(page.get_by_text(re.compile(r"demo build|do not print", re.I)).count() == 0, "no demo note is visible on the page")
    check(page.locator("a[href='/brochure']").count() >= 1, "a plain link to /brochure sits beside the code")
    OUT and page.screenshot(path=f"{OUT}/contact-1280.png", full_page=True)
    ctx.close()
    b.close()

# /brochure: to the PDF once it is in public/, to /services until then.
expect = "/brochure.pdf" if (Path(__file__).resolve().parents[1] / "public" / "brochure.pdf").exists() else "/services"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


try:
    urllib.request.build_opener(NoRedirect).open(BASE + "/brochure")
    check(False, "/brochure redirects")
except urllib.error.HTTPError as e:
    check(e.code == 307 and e.headers.get("Location", "").endswith(expect), f"/brochure -> {e.code} {e.headers.get('Location')} (expected {expect})")

print("FAILURES:", "none" if not fails else fails)
sys.exit(1 if fails else 0)
