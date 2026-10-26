import { PartnerCta } from "@/components/ui/partner-cta";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

/**
 * The header stays visible while scrolling (change 2): sticky, white, with a hairline that fades in over the first
 * 80 px of scroll where scroll-driven animations exist (`.site-header` in globals.css; decorative, so no fallback).
 * It carries TDL's full logo (change 3), the navigation (Blog last, where the Paytrail staff login sat until TDL
 * moved it to the footer only, 2026-10-26) and "Partner with us" on WhatsApp (change 5). There is no "Log In" link
 * and one Careers item (change 4).
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
          <PartnerCta location="header" variant="compact" />
        </div>
        <div className="ml-auto lg:hidden">
          <MobileMenu>
            <div className="container-site py-4">
              <nav aria-label="Primary">
                <NavLinks variant="menu" />
              </nav>
              <div className="flex flex-col items-start gap-6 py-8">
                <PartnerCta location="menu" variant="pill" size="md" />
              </div>
            </div>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
