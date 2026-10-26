"""Link check (Tier 2): no link on the site may lead to a 404 again (owner, 2026-10-24: every menu link 404ed on the
live site while the inner pages were still to come).

Crawls from "/" through every internal page it finds, collecting every <a href> in the header, the footer and the
page body. Each internal target is requested WITHOUT following redirects:
  - 200 passes;
  - 307/308 passes only if it is a deliberate redirect in next.config.ts AND its destination returns 200;
  - a #fragment must exist as an id on the destination page;
  - anything else fails, naming every page that links to it.
External links are not fetched (third-party sites are slow and flaky in CI); they must be https:, mailto: or tel:.

PENDING_ROUTES (env, space-separated) lists routes that are planned but not built yet. A link to one is reported as
NOT YET instead of failing, so the gap stays visible; the list must be emptied when the route lands.

Usage: python scripts/link-proof.py [base]   (the site must be running; exit 1 on any failure)
"""
import os, re, sys, urllib.error, urllib.request
from collections import defaultdict, deque
from html.parser import HTMLParser
from urllib.parse import urldefrag, urljoin, urlparse

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3131"
PENDING = set(os.environ.get("PENDING_ROUTES", "").split())
# Deliberate redirects (next.config.ts). Anything else that redirects is a fault.
# /blog is a page since 2026-10-26; leaving it here kept the crawl out of the blog.
REDIRECTS = {"/new-client", "/Blog", "/insights", "/index.html", "/about", "/career", "/job-openings", "/jobs", "/contact", "/brochure"}
fails, pending_hits = [], defaultdict(set)


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs, self.ids = [], set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "a" and a.get("href") is not None:
            self.hrefs.append(a["href"])


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


opener = urllib.request.build_opener(NoRedirect)


def fetch(path):
    """(status, location, body) without following redirects."""
    try:
        r = opener.open(BASE + path, timeout=20)
        body = r.read().decode("utf-8", "replace") if "html" in r.headers.get("content-type", "") else ""
        return r.status, None, body
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Location"), ""


pages, ids, linked_from = {}, {}, defaultdict(set)
queue, seen = deque(["/"]), {"/"}
while queue:
    path = queue.popleft()
    status, _, body = fetch(path)
    pages[path] = status
    if status != 200 or not body:
        continue
    p = Links()
    p.feed(body)
    ids[path] = p.ids
    for href in p.hrefs:
        if href.startswith(("mailto:", "tel:")):
            continue
        absu = urljoin(BASE + path, href)
        u = urlparse(absu)
        if u.netloc and u.netloc != urlparse(BASE).netloc:
            if u.scheme != "https":
                fails.append(f"external link is not https: {href} (on {path})")
            continue
        target, frag = urldefrag(u.path + (f"?{u.query}" if u.query else "") + (f"#{u.fragment}" if u.fragment else ""))
        linked_from[(target, frag)].add(path)
        route = urlparse(target).path
        is_page = not re.search(r"\.[a-z0-9]{2,4}$", route)
        if is_page and route not in seen and route not in REDIRECTS and route not in PENDING:
            seen.add(route)
            queue.append(route)

checked = 0
for (target, frag), sources in sorted(linked_from.items()):
    route = urlparse(target).path
    src = ", ".join(sorted(sources)[:4]) + (" …" if len(sources) > 4 else "")
    if route in PENDING:
        pending_hits[route] |= sources
        continue
    status, location, body = fetch(target)
    checked += 1
    if status in (307, 308):
        if route not in REDIRECTS:
            fails.append(f"{target} redirects ({status} -> {location}) but is not a deliberate redirect (linked from {src})")
            continue
        dest = urlparse(urljoin(BASE + target, location or "")).path
        dstatus, _, _ = fetch(dest)
        if dstatus != 200:
            fails.append(f"{target} -> {dest} returns {dstatus} (linked from {src})")
        continue
    if status != 200:
        fails.append(f"{target} returns {status} (linked from {src})")
        continue
    if frag:
        if route not in ids:
            p = Links()
            p.feed(body)
            ids[route] = p.ids
        if frag not in ids[route]:
            fails.append(f"{target}#{frag}: no element with id '{frag}' (linked from {src})")

print(f"  crawled {len(pages)} pages, checked {checked} distinct internal links")
for route, sources in sorted(pending_hits.items()):
    print(f"  NOT YET {route}: linked from {len(sources)} page(s) but listed in PENDING_ROUTES; build it, then remove it from the list")
for f in fails:
    print(f"  FAIL {f}")
print("\nFAILURES:", "none" if not fails else len(fails))
sys.exit(1 if fails else 0)
