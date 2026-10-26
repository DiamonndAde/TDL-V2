import { Download } from "lucide-react";
import { brochureReady, brochureSize } from "@/lib/brochure";
import { ButtonPill } from "./button-pill";

/**
 * "Download our brochure" (TDL, 2026-10-26), on the services index and every service page. It links to the stable
 * /brochure address (307 to the current PDF, next.config.ts) and states the file size. Renders nothing until
 * public/brochure.pdf exists, since /brochure then goes to /services.
 */
export function BrochureButton({ tone = "accent" }: { tone?: "accent" | "light" }) {
  if (!brochureReady) return null;
  return (
    <ButtonPill href="/brochure" download tone={tone} ariaLabel={`Download our brochure (PDF, ${brochureSize})`}>
      <Download size={18} aria-hidden="true" />
      {/* The size wraps the pill onto two lines on phones, so it is visible from sm and always in the accessible name. */}
      <span className="whitespace-nowrap">
        Download our brochure<span className="hidden font-normal sm:inline"> (PDF, {brochureSize})</span>
      </span>
    </ButtonPill>
  );
}
