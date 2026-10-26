"use client";

import { analyticsConfigured } from "@/lib/analytics/config";
import { LazyWhen, lazyGate } from "./lazy-when";

/**
 * The gate. `analyticsConfigured` is a build-time constant (`NEXT_PUBLIC_POSTHOG_KEY` is inlined), so with no
 * key nothing renders, the runtime chunk is never requested, and neither the consent store nor the SDK starter
 * reaches any route's first-load JS. What remains is the gate itself: 0.5 KB per route.
 */
const Runtime = lazyGate(() => import("./analytics-runtime"));

export function Analytics() {
  return <LazyWhen enabled={analyticsConfigured} component={Runtime} />;
}

/**
 * The cookie consent banner, in every build (TDL, 2026-10-26: "they mean the cookie consent pop-up"). Accept and
 * Reject are recorded either way; Accept starts analytics only when a key exists (`Runtime` above). Its own chunk,
 * loaded after hydration, so no route's first-load JS carries it.
 */
const Banner = lazyGate(() => import("./consent-banner").then((m) => ({ default: m.ConsentBanner })));

export function ConsentPrompt() {
  return <LazyWhen enabled component={Banner} />;
}
