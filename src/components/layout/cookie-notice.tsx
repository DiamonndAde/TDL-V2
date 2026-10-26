"use client";

import { useSyncExternalStore } from "react";
import { useAfterFirstPaint } from "@/lib/after-first-paint";

/**
 * The cookie notice (TDL, 2026-10-26: "the cookie policy also"): a simple first-visit notice in the site's style,
 * linking to the Cookies policy, with one OK button. Dismissal is remembered. It is shown only while analytics is
 * off; with a PostHog key the consent banner (consent-banner.tsx) takes its place, so a visitor never sees both.
 *
 * Unlike the WordPress SureCookie box (audit §2.0), it offers no choices, because without analytics there is
 * nothing to choose: the site sets no cookies of its own. The wording therefore points to the policy rather than
 * claiming anything itself.
 *
 * Same rules as the consent banner: `position: fixed` and mounted only after first paint, so it shifts nothing and
 * is never the LCP element; a labelled region; focus is never moved or trapped. The dismissal is kept in
 * `localStorage`, not a cookie.
 */
const KEY = "tdl.cookie-notice";
const listeners = new Set<() => void>();
let dismissed: boolean | null = null;

function read(): boolean {
  if (dismissed !== null) return dismissed;
  try {
    dismissed = window.localStorage.getItem(KEY) === "ok";
  } catch {
    dismissed = false; // Blocked storage: show it; OK still hides it for this page view.
  }
  return dismissed;
}

function dismiss() {
  dismissed = true;
  try {
    window.localStorage.setItem(KEY, "ok");
  } catch {
    // Not remembered, but hidden for this page view.
  }
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      dismissed = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export default function CookieNotice() {
  // Server snapshot "dismissed": nothing renders until the client knows.
  const isDismissed = useSyncExternalStore(subscribe, read, () => true);
  const painted = useAfterFirstPaint();
  if (isDismissed || !painted) return null;
  return (
    <section
      aria-label="Cookies"
      className="on-dark fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-navy text-white sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-md sm:rounded-2xl sm:border sm:shadow-[0_15px_40px_rgb(15_23_42/0.35)]"
    >
      <div className="flex items-center gap-5 px-5 py-4 sm:px-6 sm:py-5">
        <p className="text-sm text-on-dark-muted">
          How this website uses cookies is set out in our{" "}
          <a href="/cookies-policy" className="text-white underline underline-offset-4">
            Cookies policy
          </a>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full border-2 border-white bg-transparent px-6 py-2 font-bold text-white transition-colors duration-150 hover:bg-white hover:text-navy"
        >
          OK
        </button>
      </div>
    </section>
  );
}
