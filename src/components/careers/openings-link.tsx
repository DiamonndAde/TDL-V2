"use client";

import { ButtonPill } from "@/components/ui/button-pill";
import { useCtaVariant } from "@/lib/analytics/experiment";
import { track } from "@/lib/analytics/track";

/**
 * The handoff to TDL's applicant tracking system, and the point where our view of the funnel ends: the click is
 * recorded here; whether it became an application happens inside the ATS (Q29f, docs/ANALYTICS-PROPOSAL.md §3).
 *
 * The href is already decorated by the recruitment adapter, so this component knows nothing about which ATS it is.
 * The wording is the subject of a prepared, switched-off experiment: with experiments off (every environment today)
 * `useCtaVariant()` returns the control, "See open roles", server-rendered and unchanging.
 */
export function OpeningsLink({ href }: { href: string }) {
  const { variant, label } = useCtaVariant();
  return (
    <ButtonPill
      href={href}
      external
      ariaLabel={`${label} on our recruitment portal (opens in a new tab)`}
      onClick={() => track({ name: "openings_clicked", destination: "ats", cta_variant: variant })}
    >
      {label}
    </ButtonPill>
  );
}
