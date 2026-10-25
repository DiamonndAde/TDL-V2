import QRCode from "qrcode";
import { brochureQrTarget, brochureReady } from "@/lib/brochure";

/**
 * The brochure QR code (change 7), drawn as SVG when the page is prerendered: the `qrcode` package runs at build
 * time and the browser gets markup only. Navy modules on white, error correction M, the standard four-module quiet
 * zone. It encodes the stable /brochure address, which redirects to the PDF (next.config.ts, Q32); a demo build
 * encodes the demo's own address. No demo note is shown on the page (owner, 2026-10-25): the rule "never print a QR
 * from a demo build" lives in HANDOFF.md and PLACEHOLDERS.md instead.
 */
export async function BrochureQr() {
  const { url } = brochureQrTarget();
  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 4,
    color: { dark: "#0F172A", light: "#FFFFFF" },
  });
  const what = brochureReady ? "our brochure (PDF)" : "our services";
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        role="img"
        aria-label={`QR code for ${url}`}
        className="size-40 shrink-0 rounded-md border border-navy/15 bg-white [&>svg]:h-full [&>svg]:w-full"
        // Generated from a fixed string at build time; no user input reaches it.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="max-w-xs min-w-0">
        <p>Scan with a phone camera to open {what}.</p>
        <p className="mt-2">
          <a href="/brochure" className="font-bold text-accent-strong underline decoration-2 underline-offset-[6px]">
            Open {what}
          </a>
        </p>
      </div>
    </div>
  );
}
