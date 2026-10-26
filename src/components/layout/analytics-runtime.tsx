"use client";

import { AnalyticsProvider } from "./analytics-provider";

/**
 * The SDK starter. Loaded as a lazy chunk by `analytics.tsx`, and only when a project key exists, so without one the
 * SDK is never requested. The consent banner is separate since 2026-10-26: it shows in every build (TDL), and
 * Accept starts analytics only through this component, which does not exist without a key.
 */
export default function AnalyticsRuntime() {
  return <AnalyticsProvider />;
}
