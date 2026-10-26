import { NextResponse, type NextRequest } from "next/server";

/**
 * One job: 308 the original site's "/Blog" (any capitalisation but the real one) to "/blog".
 *
 * It cannot be a `redirects()` entry. Next matches redirect sources case-insensitively (`caseSensitiveRoutes` is off
 * and experimental), so `/Blog → /blog` also matched `/blog` and redirected it to itself, a loop. App routes are
 * case-sensitive, so without this `/Blog` is a 404 (both measured 2026-10-26). Here the exact path is compared, and
 * `/blog` passes straight through even if the matcher below matches it too.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname !== "/blog" && pathname.toLowerCase() === "/blog") {
    return NextResponse.redirect(new URL("/blog", request.url), 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/Blog"],
};
