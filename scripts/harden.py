"""Tier 3 hardening pass, against a production server on :3131. Ported from v1's harden.py and rewritten for v2's
structure (no Roster canvas, no service tabs; a popover menu, testimonial cards and a three-step form instead).

   bash scripts/serve-and-run.sh python scripts/harden.py [outdir]

Checks, each printed ok/FAIL with the evidence:
  1. URLs: every route is served (200), its trailing-slash form 308s to it, every redirect in next.config.ts is a
     single 308 (or the 307 for /brochure) to a page that answers 200, and WordPress leftovers end in a clean 404.
  2. Sitemap, robots and noindex: the sitemap lists exactly the indexable routes as absolute https URLs; robots
     points at it; the blog is indexable; a *.vercel.app host gets X-Robots-Tag: noindex, nofollow and the real host
     does not.
  3. JSON-LD and metadata: every block parses and holds no raw "<"; no @id appears twice on a page; Organization and
     LocalBusiness on every page; seven Service nodes on /services and exactly the matching one per service page;
     every route has a unique <title> and meta description.
  4. axe-core on every route at 1280 and 390: no serious or critical violations (lesser ones listed).
  5. Keyboard: skip link, header, testimonial links, the logo marquee's pause, the phone menu (open, Tab inside,
     Escape returns focus) and the three-step form, with a visible focus ring at every stop.
  6. Reduced motion: figures final at t=0, nothing animating at rest, the headline fully visible, the marquee still.
Exit code 1 on any FAIL.
"""
from __future__ import annotations

import json, re, sys, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3131"
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
AXE = Path(__file__).resolve().parents[1] / "node_modules" / "axe-core" / "axe.min.js"
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else None
fails: list[str] = []


def check(ok: bool, label: str, detail: str = ""):
    print(("  ok   " if ok else "  FAIL ") + label + (f": {detail}" if detail else ""))
    if not ok:
        fails.append(label)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def fetch(path: str, headers: dict | None = None):
    """(status, headers, body) without following redirects."""
    opener = urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(BASE + path, headers=headers or {})
    try:
        with opener.open(req) as r:
            return r.status, r.headers, r.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return e.code, e.headers, ""


def chain(path: str, limit: int = 5):
    """Follow redirects by hand: ([(status, location)], final_status, final_path). The hops are checked, not just
    the destination: a chain of mixed codes loses the equivalence a single permanent redirect carries."""
    hops, cur = [], path
    for _ in range(limit):
        st, h, _ = fetch(cur)
        loc = (h.get("location") or "").replace(BASE, "")
        if st in (301, 302, 307, 308) and loc:
            hops.append((st, loc))
            cur = loc
            continue
        return hops, st, cur
    return hops, None, cur


SERVICES = ["human-resources-outsourcing", "business-process-outsourcing", "recruitment-background-check",
            "learning-and-development", "payroll-management", "business-advisory", "technology-solutions"]
POSTS = ["what-to-look-for-in-an-hr-outsourcing-partner", "running-payroll-across-more-than-one-state", "why-background-checks-matter-before-an-offer"]
INDEXABLE = ["/", "/services", "/work", "/about-us", "/careers", "/contact-us", "/become-a-client", "/certifications",
             "/privacy-policy", "/cookies-policy", "/blog"] + [f"/services/{s}" for s in SERVICES] + [f"/blog/{p}" for p in POSTS]
ROUTES = INDEXABLE
REDIRECTS = [("/new-client", "/become-a-client"), ("/new-client/", "/become-a-client"), ("/Blog", "/blog"),
             ("/insights", "/blog"), ("/index.html", "/"), ("/about", "/about-us"), ("/career", "/careers"),
             ("/job-openings", "/careers"), ("/jobs", "/careers"), ("/contact", "/contact-us")]

# ---------------------------------------------------------------- 1. URLs
print("\n1. URLs")
for p in ROUTES:
    st, _, _ = fetch(p)
    check(st == 200, f"{p} served", str(st))
    if p != "/":
        st, h, _ = fetch(p + "/")
        check(st == 308 and (h.get("location") or "").endswith(p), f"{p}/ → {p}", f"{st} {h.get('location')}")
for src, dst in REDIRECTS:
    hops, st, final = chain(src)
    check(hops and all(h[0] == 308 for h in hops) and final == dst and st == 200, f"{src} → {dst} by 308 only",
          f"{' → '.join(f'{s} {l}' for s, l in hops)} then {st}")
hops, st, final = chain("/brochure")
check(len(hops) == 1 and hops[0][0] == 307 and st == 200, "/brochure → the current brochure by one 307",
      f"{hops} then {st} at {final}")
for junk in ["/sample-page/", "/2025/04/22/hello-world/", "/category/uncategorized/", "/wp-admin/", "/services/nope", "/blog/nope"]:
    hops, st, _ = chain(junk)
    check(st == 404, f"leftover {junk} ends in a clean 404", f"{len(hops)} hop(s) then {st}")

# ---------------------------------------------------------------- 2. sitemap, robots, noindex
print("\n2. Sitemap, robots and noindex")
_, _, xml = fetch("/sitemap.xml")
ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
locs = [el.text or "" for el in ET.fromstring(xml).findall(".//s:loc", ns)]
paths = sorted(re.sub(r"^https?://[^/]+", "", u) or "/" for u in locs)
check(paths == sorted(INDEXABLE), "sitemap lists exactly the indexable routes",
      f"extra={sorted(set(paths) - set(INDEXABLE))} missing={sorted(set(INDEXABLE) - set(paths))}")
check(all(u.startswith("https://") for u in locs), "sitemap URLs are absolute https", locs[0] if locs else "none")
_, _, robots = fetch("/robots.txt")
check("Sitemap:" in robots and "sitemap.xml" in robots, "robots.txt points at the sitemap", robots.replace("\n", " | "))
_, _, blog = fetch("/blog")
check(re.search(r'<meta name="robots" content="[^"]*noindex', blog) is None, "/blog is indexable (no noindex)")
_, h, _ = fetch("/", {"Host": "tdl-website-v2.vercel.app"})
check("noindex" in (h.get("x-robots-tag") or ""), "*.vercel.app host gets X-Robots-Tag noindex", str(h.get("x-robots-tag")))
_, h, _ = fetch("/", {"Host": "totaldatalimited.com"})
check(h.get("x-robots-tag") is None, "the real host is indexable (no X-Robots-Tag)", str(h.get("x-robots-tag")))

# ---------------------------------------------------------------- 3. JSON-LD and metadata
print("\n3. JSON-LD and metadata")
titles: dict[str, str] = {}
descs: dict[str, str] = {}
for route in ROUTES:
    _, _, html = fetch(route)
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    types: list[str] = []
    ids: list[str] = []
    service_urls: list[str] = []
    bad = False
    for blk in blocks:
        if "<" in blk:
            bad = True
        try:
            node = json.loads(blk)
        except json.JSONDecodeError:
            bad = True
            continue
        for it in node.get("@graph", [node]):
            t = it.get("@type")
            types += t if isinstance(t, list) else [t]
            if "@id" in it:
                ids.append(it["@id"])
            if t == "Service":
                service_urls.append(re.sub(r"^https?://[^/]+", "", it.get("url", "")))
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    need = {"Organization", "LocalBusiness"} <= set(types)
    if route.startswith("/blog/") and "BlogPosting" not in types:
        bad = True
    if route == "/services":
        svc_ok = len(service_urls) == 7
    elif route.startswith("/services/"):
        svc_ok = service_urls == [route]
    else:
        svc_ok = not service_urls
    check(not bad and not dupes and need and svc_ok, f"{route} JSON-LD {sorted(set(types))}",
          ("unparsable or raw '<'; " if bad else "") + (f"duplicate @id {dupes}; " if dupes else "")
          + ("" if svc_ok else f"Service urls {service_urls}"))
    m = re.search(r"<title>(.*?)</title>", html, re.S)
    titles[route] = m.group(1) if m else ""
    m = re.search(r'<meta name="description" content="([^"]*)"', html)
    descs[route] = m.group(1) if m else ""
for label, seen in (("title", titles), ("meta description", descs)):
    empty = [r for r, v in seen.items() if not v.strip()]
    shared = sorted({v for v in seen.values() if list(seen.values()).count(v) > 1})
    check(not empty and not shared, f"every route has a unique {label}", f"empty={empty} shared={shared[:2]}")

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    axe_src = AXE.read_text(encoding="utf-8")

    # ------------------------------------------------------------ 4. axe
    print("\n4. axe-core (serious/critical must be zero)")
    for width in (1280, 390):
        ctx = b.new_context(viewport={"width": width, "height": 900 if width > 400 else 800},
                            device_scale_factor=1 if width > 400 else 2)
        pg = ctx.new_page()
        for route in ROUTES:
            pg.goto(BASE + route)
            pg.wait_for_load_state("load")
            # Past the headline's typing and the first reveals: a frame mid-fade is legitimately low-contrast.
            pg.wait_for_timeout(2500 if route == "/" else 900)
            pg.add_script_tag(content=axe_src)
            res = pg.evaluate("async () => { const r = await axe.run(document, {resultTypes: ['violations']});"
                              " return r.violations.map(v => ({id: v.id, impact: v.impact, n: v.nodes.length,"
                              " targets: v.nodes.slice(0,3).map(n => n.target.join(' '))})); }")
            severe = [v for v in res if v["impact"] in ("serious", "critical")]
            minor = [v for v in res if v["impact"] not in ("serious", "critical")]
            detail = "; ".join(f"{v['id']}({v['impact']}×{v['n']}) {v['targets'][0][:80]}" for v in res)
            check(not severe, f"{width}px {route}" + (f" (also {len(minor)} lesser)" if minor else ""), detail)
        ctx.close()

    # ------------------------------------------------------------ 5. keyboard
    print("\n5. Keyboard")

    def focus_state(pg):
        return pg.evaluate("""() => { const el = document.activeElement; const cs = getComputedStyle(el);
            return {tag: el.tagName, id: el.id, href: el.getAttribute('href'),
                    text: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 40),
                    name: el.getAttribute('aria-label') || (el.innerText || '').trim().slice(0, 60),
                    ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0,
                    visible: el.matches(':focus-visible')}; }""")

    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    pg = ctx.new_page()
    pg.goto(BASE + "/")
    pg.wait_for_load_state("load")
    pg.wait_for_timeout(800)
    pg.keyboard.press("Tab")
    f = focus_state(pg)
    check(f["text"].startswith("Skip to content") and f["ring"], "first Tab lands on the skip link, with a ring", json.dumps(f))
    pg.keyboard.press("Enter")
    pg.wait_for_timeout(200)
    pg.keyboard.press("Tab")
    f = focus_state(pg)
    in_main = pg.evaluate("() => !!document.activeElement.closest('main')")
    check(in_main and f["ring"], "skip link: the next Tab is inside main", json.dumps(f))

    # The header, in order, every stop with a ring. Reload so Tab starts from the top again.
    pg.goto(BASE + "/")
    pg.wait_for_load_state("load")
    pg.wait_for_timeout(500)
    stops = []
    for _ in range(12):
        pg.keyboard.press("Tab")
        f = focus_state(pg)
        if not pg.evaluate("() => !!document.activeElement.closest('header')") and f["text"] != "Skip to content":
            break
        stops.append(f)
    names = [s["name"] for s in stops]
    check(all(s["ring"] for s in stops), "every header stop shows a focus ring", " | ".join(names))
    check(any(n.lower() == "blog" for n in names), "header: Blog is reachable", " | ".join(names))
    check(not any("Paytrail" in n or "staff login" in n.lower() for n in names), "header: no Paytrail link (footer only, TDL 2026-10-26)", " | ".join(names))
    _, _, home = fetch("/")
    footer = home[home.find("<footer"):]
    check("paytrail-tdl.com/login" in footer, "footer: the Paytrail staff login is still there")
    check(any(n == "Partner with us on WhatsApp" for n in names), "header: Partner with us is reachable, named for WhatsApp", " | ".join(names))

    links = pg.locator("a[href^='/work#']")
    check(links.count() == 3, "three testimonial cards, each linking to its full quote on /work", str(links.count()))
    links.first.focus()
    hrefs = []
    for i in range(3):
        f = focus_state(pg)
        hrefs.append(f["href"])
        check(f["ring"] and "Read the full quote from" in pg.evaluate("() => document.activeElement.textContent"),
              f"testimonial link {i + 1} has a ring and names the person", json.dumps(f))
        if i < 2:
            pg.keyboard.press("Tab")
            pg.wait_for_timeout(100)
    check(hrefs == ["/work#carlcare", "/work#chi", "/work#transsnet"], "Tab moves through the cards in order", str(hrefs))
    for h in hrefs:
        _, _, work = fetch("/work")
        check(f'id="{h.split("#")[1]}"' in work, f"{h} lands on an existing anchor")

    pause = pg.get_by_role("button", name=re.compile("logo scroll", re.I))
    if pause.count():
        pause.focus()
        before = pause.get_attribute("aria-label")
        pg.keyboard.press("Enter")
        pg.wait_for_timeout(150)
        after = pause.get_attribute("aria-label")
        f = focus_state(pg)
        check(f["ring"] and before != after, "logo marquee: the pause control works by keyboard", f"{before} → {after}")
    else:
        check(False, "logo marquee: a pause control exists")
    if OUT:
        pg.screenshot(path=str(OUT / "harden-keyboard-1280.png"))
    ctx.close()

    # The phone menu: a native popover. Opens on Enter, takes Tab, closes on Escape with focus back on the toggle.
    ctx = b.new_context(viewport={"width": 390, "height": 800}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.goto(BASE + "/")
    pg.wait_for_load_state("load")
    pg.wait_for_timeout(600)
    toggle = pg.locator("button[popovertarget='site-menu']")
    toggle.focus()
    f = focus_state(pg)
    check(f["ring"], "menu toggle shows a focus ring", json.dumps(f))
    pg.keyboard.press("Enter")
    pg.wait_for_timeout(300)
    is_open = pg.evaluate("() => document.getElementById('site-menu').matches(':popover-open')")
    check(is_open, "Enter opens the menu")
    pg.keyboard.press("Tab")
    inside = pg.evaluate("() => !!document.activeElement.closest('#site-menu')")
    f = focus_state(pg)
    check(inside and f["ring"], "Tab moves into the open menu", json.dumps(f))
    if OUT:
        pg.screenshot(path=str(OUT / "harden-menu-390.png"))
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(300)
    closed = not pg.evaluate("() => document.getElementById('site-menu').matches(':popover-open')")
    back = pg.evaluate("() => document.activeElement.getAttribute('popovertarget') === 'site-menu'")
    check(closed and back, "Escape closes the menu and returns focus to the toggle", f"closed={closed} focus_on_toggle={back}")
    ctx.close()

    # The three-step form.
    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    pg = ctx.new_page()
    pg.goto(BASE + "/become-a-client")
    pg.wait_for_load_state("load")
    pg.wait_for_timeout(800)
    pg.locator("#services input[type=checkbox]").first.focus()
    f = focus_state(pg)
    check(f["tag"] == "INPUT" and f["visible"] and f["ring"], "step 1: the first service checkbox has a ring", json.dumps(f))
    pg.keyboard.press("Space")
    pg.locator("#headcount input[type=radio]").first.focus()
    pg.keyboard.press("Space")
    pg.wait_for_timeout(100)
    ok = pg.evaluate("() => !!(document.querySelector('#services input:checked') && document.querySelector('#headcount input:checked'))")
    check(ok, "Space ticks a service and a headcount")
    pg.get_by_role("button", name="Continue").focus()
    pg.keyboard.press("Enter")
    pg.wait_for_timeout(500)
    f = focus_state(pg)
    check(f["tag"] == "H2" and "organisation" in f["text"].lower(), "Continue moves to step 2 with focus on its heading", json.dumps(f))
    pg.keyboard.press("Tab")
    f = focus_state(pg)
    check(f["id"] == "organisation" and f["ring"], "Tab from the heading reaches step 2's first field", json.dumps(f))
    pg.get_by_role("button", name="Continue").focus()
    pg.keyboard.press("Enter")
    pg.wait_for_timeout(400)
    f = focus_state(pg)
    errs = pg.locator("[aria-invalid=true]").count()
    check(f["id"] == "organisation" and errs > 0, "Continue with empty fields: focus on the first invalid field, errors shown",
          json.dumps(f) + f" invalid={errs}")
    pg.get_by_role("button", name="Back", exact=True).focus()
    pg.keyboard.press("Enter")
    pg.wait_for_timeout(400)
    f = focus_state(pg)
    check(f["tag"] == "H2" and "need" in f["text"].lower(), "Back returns to step 1 with focus on its heading", json.dumps(f))
    ctx.close()

    # ------------------------------------------------------------ 6. reduced motion
    print("\n6. Reduced motion")
    ctx = b.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="reduce")
    pg = ctx.new_page()
    pg.goto(BASE + "/", wait_until="domcontentloaded")
    FIG = "section[aria-label='Total Data Limited in figures'] li p:first-of-type"
    fig0 = pg.locator(FIG).all_inner_texts()
    pg.wait_for_load_state("load")
    pg.wait_for_timeout(1500)
    fig1 = pg.locator(FIG).all_inner_texts()
    check(fig0 == fig1 and all(re.search(r"[1-9]", v) for v in fig1), "figures are final at t=0 and unchanged after 1.5 s", " | ".join(fig1))
    pg.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
    pg.wait_for_timeout(800)
    pg.evaluate("() => window.scrollTo(0, 0)")
    pg.wait_for_timeout(300)
    # Scroll-driven timelines are excluded: the header hairline follows the scroll position, which is not motion.
    running = pg.evaluate("""() => document.getAnimations()
        .filter(a => a.playState === 'running' && !(window.ScrollTimeline && a.timeline instanceof ScrollTimeline))
        .map(a => (a.animationName || a.constructor.name) + ' on ' + (a.effect && a.effect.target ? a.effect.target.className : '?'))""")
    check(not running, "nothing animating at rest, after scrolling the whole page", "; ".join(str(r)[:80] for r in running[:3]))
    h1 = pg.evaluate("""() => { const h = document.querySelector('h1'); const cs = getComputedStyle(h);
        const hidden = [...h.querySelectorAll('*')].filter(e => { const c = getComputedStyle(e);
          return (c.opacity === '0' || c.visibility === 'hidden') && !e.closest('[aria-hidden=true]') && !e.classList.contains('sr-only'); }).length;
        return {opacity: cs.opacity, visibility: cs.visibility, hiddenChildren: hidden, text: h.textContent.trim()}; }""")
    check(h1["opacity"] == "1" and h1["visibility"] == "visible" and h1["hiddenChildren"] == 0
          and "You run the business." in h1["text"], "headline fully visible", json.dumps(h1))
    if OUT:
        pg.screenshot(path=str(OUT / "harden-reduced-motion-1280.png"))
    ctx.close()

    # ------------------------------------------------------------ 7. cookie notice (analytics off)
    print("\n7. Cookie notice")
    NOTICE = "section[aria-label='Cookies']"
    for width in (390, 1280):
        ctx = b.new_context(viewport={"width": width, "height": 800})
        ctx.add_init_script("""window.__lcp = null; window.__cls = 0;
          new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.element; }).observe({type: 'largest-contentful-paint', buffered: true});
          new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({type: 'layout-shift', buffered: true});""")
        pg = ctx.new_page()
        pg.goto(BASE + "/services")
        pg.wait_for_load_state("load")
        pg.wait_for_timeout(2500)
        shown = pg.locator(NOTICE).count() == 1
        check(shown, f"{width}px: the notice shows on a first visit")
        if not shown:
            ctx.close()
            continue
        link = pg.locator(f"{NOTICE} a[href='/cookies-policy']").count()
        check(link == 1, f"{width}px: it links to the Cookies policy")
        m = pg.evaluate("() => ({inNotice: !!(window.__lcp && window.__lcp.closest(\"section[aria-label='Cookies']\")), cls: window.__cls, focus: document.activeElement.tagName})")
        check(not m["inNotice"] and m["cls"] < 0.01 and m["focus"] == "BODY", f"{width}px: not the LCP element, no layout shift, focus left alone", json.dumps(m))
        if OUT:
            pg.screenshot(path=str(OUT / f"cookie-notice-{width}.png"))
        pg.get_by_role("button", name="OK", exact=True).click()
        pg.wait_for_timeout(300)
        check(pg.locator(NOTICE).count() == 0, f"{width}px: OK hides it")
        pg.reload()
        pg.wait_for_load_state("load")
        pg.wait_for_timeout(2500)
        check(pg.locator(NOTICE).count() == 0, f"{width}px: it stays dismissed after a reload")
        ctx.close()
    _, _, home = fetch("/")
    check('href="/cookies-policy"' in home[home.find("<footer"):], "the footer links the Cookies policy")
    b.close()

print("\nFAILURES:", ", ".join(fails) if fails else "none")
sys.exit(1 if fails else 0)
