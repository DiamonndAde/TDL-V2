"use client";

import { LazyWhen, lazyGate } from "./lazy-when";

/**
 * Footer control for changing the cookie choice. In every build since 2026-10-26, like the banner it reopens.
 */
const Control = lazyGate(() => import("./consent-reopen-control"));

export function ConsentReopen() {
  return <LazyWhen enabled component={Control} />;
}
