"use client";

import { useEffect, useState } from "react";
import { denyConsent, grantConsent, useShouldAskConsent } from "@/lib/analytics/consent";
import { useAfterFirstPaint } from "@/lib/after-first-paint";

/**
 * The analytics consent choice, ported from v1 with v2's look. The site's only non-essential script sits behind it.
 *
 * Rules it implements (v1's approval conditions, unchanged):
 *  - **Accept and Reject carry equal weight**: same element, size, border and type. Declining is one press, exactly
 *    like accepting, and neither is hidden behind a settings screen.
 *  - **No layout shift, never the LCP element**: the bar is `position: fixed` and mounts only after first paint, so it
 *    shifts nothing; its copy stays short so it never out-sizes a page's own LCP candidate (consent-proof.py measures
 *    both on every route).
 *  - **Keyboard and screen reader**: a labelled region; focus is never moved or trapped; an `aria-live` line says it
 *    has appeared.
 *
 * Shown in every build since 2026-10-26 (TDL: the cookie consent pop-up). Without a project key the choice is simply
 * recorded; Accept starts analytics only when a key exists (analytics-runtime.tsx).
 */
export function ConsentBanner() {
  const asking = useShouldAskConsent();
  const painted = useAfterFirstPaint();
  const [announced, setAnnounced] = useState(false);

  // Announce once, a beat after it appears, so the live region is registered before its content changes.
  useEffect(() => {
    if (asking && painted && !announced) {
      const t = window.setTimeout(() => setAnnounced(true), 120);
      return () => window.clearTimeout(t);
    }
  }, [asking, painted, announced]);

  if (!asking || !painted) return null;

  const choice =
    "rounded-full border-2 border-white bg-transparent px-6 py-2.5 font-bold text-white transition-colors duration-150 hover:bg-white hover:text-navy";
  return (
    <section aria-labelledby="consent-title" className="on-dark fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-navy text-white">
      <div className="container-site flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="max-w-[52em]">
          <h2 id="consent-title" className="font-bold text-white">
            Help us improve this site?
          </h2>
          {/* Kept to about two lines at phone width: a longer paragraph out-sized the short page lead on /services and
              became the LCP element (scripts/consent-proof.py, 2026-10-24). */}
          <p className="mt-1 text-sm text-on-dark-muted">
            We would like to measure how people use our forms, to make them easier. We never record what you type.{" "}
            <a href="/cookies-policy" className="text-white underline underline-offset-4">
              Cookies policy
            </a>
          </p>
        </div>
        {/* Equal prominence, not merely equal size: the two buttons are identical apart from the word on them. */}
        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={grantConsent} className={choice}>
            Accept
          </button>
          <button type="button" onClick={denyConsent} className={choice}>
            Reject
          </button>
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {announced ? "A choice about website analytics is available at the end of the page." : ""}
      </p>
    </section>
  );
}
