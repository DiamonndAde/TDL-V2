/**
 * Why a form submission failed: an enum, never the error text, so nothing ever string-matches what the visitor reads.
 * Shared by both server actions; the analytics events (step 11) report it as is.
 */
export type FailureReason = "validation" | "delivery" | "unconfigured" | "network";
