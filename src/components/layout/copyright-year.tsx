import { cacheLife } from "next/cache";

/**
 * The current year for the copyright line (Q3: auto-generate, never hard-code). Reading the clock during prerender
 * needs a cache boundary under Cache Components; cached for a day, so the line turns over on 1 January.
 */
export async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
