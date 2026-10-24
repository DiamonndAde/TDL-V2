import { company } from "@/content/facts";
import { PartnerCta } from "@/components/ui/partner-cta";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

/**
 * The header stays visible while scrolling (change 2): sticky, white, with a hairline that fades in over the first
 * 80 px of scroll where scroll-driven animations exist (`.site-header` in globals.css; decorative, so no fallback).
 * It carries TDL's full logo (change 3), the navigation, the Paytrail staff login (change 1) and "Partner with us"
 * on WhatsApp (change 5). There is no "Log In" link and one Careers item (change 4).
 */
export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-50 bg-white">
      <div className="container-site flex h-(--header-h) items-center gap-5 xl:gap-8">
        <Logo />
        <nav aria-label="Primary" className="ml-auto hidden items-center gap-5 lg:flex xl:gap-7">
          <NavLinks variant="bar" />
        </nav>
        <div className="hidden items-center gap-5 lg:flex xl:gap-6">
          <StaffLoginLink className="text-[0.8125rem] font-bold text-navy" />
          <PartnerCta variant="compact" />
        </div>
        <div className="ml-auto lg:hidden">
          <MobileMenu>
            <div className="container-site py-4">
              <nav aria-label="Primary">
                <NavLinks variant="menu" />
              </nav>
              <div className="flex flex-col items-start gap-6 py-8">
                <PartnerCta variant="pill" size="md" />
                <StaffLoginLink className="text-base font-bold text-navy" />
              </div>
            </div>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}

/** Secondary to the main action: a link, never a button. Opens in a new tab. Label from facts.ts (Q31). */
export function StaffLoginLink({ className = "", label = company.staffPortal.headerLabel }: { className?: string; label?: string }) {
  return (
    <a
      href={company.staffPortal.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline decoration-accent decoration-2 underline-offset-[6px] transition-colors hover:text-accent-strong ${className}`}
    >
      {label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
