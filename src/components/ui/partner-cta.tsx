import { company } from "@/content/facts";
import type { ServiceSlug } from "@/content/services";
import { ButtonPill } from "./button-pill";
import { WhatsAppMark } from "./whatsapp-mark";

/**
 * "Partner with us": TDL's main call to action (change 5). It opens WhatsApp on +234 818 546 1010 (confirmed by
 * TDL 2026-10-17, Q20) with a prefilled first message, in a new tab. The message names the service on a service
 * page so TDL knows what the conversation is about before replying.
 *
 * The visible label is TDL's, exactly. Because it doesn't itself say WhatsApp opens, the button carries the
 * WhatsApp mark and its accessible name is "Partner with us on WhatsApp", which contains the visible label as
 * WCAG 2.5.3 requires.
 *
 * `variant`: "pill" is the WordPress button (label plus arrow circle) for heroes and bands; "compact" is a single
 * pill for the header.
 */
export function PartnerCta({
  variant = "pill",
  service,
  size = "lg",
  className = "",
}: {
  variant?: "pill" | "compact";
  /** On a service page: the slug and display name, so the message carries it. */
  service?: { slug: ServiceSlug; name: string };
  size?: "md" | "lg";
  className?: string;
}) {
  const message = service ? company.whatsappMessage.service(service.name) : company.whatsappMessage.general;
  const href = `${company.whatsappHref}?text=${encodeURIComponent(message)}`;
  const ariaLabel = "Partner with us on WhatsApp";

  if (variant === "compact") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={`inline-flex h-11 items-center gap-2 rounded-full bg-accent-strong px-5 text-[0.9375rem] font-bold leading-none text-white transition-colors duration-200 hover:bg-accent-strong-hover ${className}`}
      >
        <WhatsAppMark size={17} />
        Partner with us
      </a>
    );
  }
  return (
    <ButtonPill href={href} external ariaLabel={ariaLabel} size={size} className={className}>
      <WhatsAppMark />
      Partner with us
    </ButtonPill>
  );
}
