import Link from "next/link";
import { company } from "@/content/facts";
import { services } from "@/content/services";
import { PartnerCta } from "@/components/ui/partner-cta";
import { ConsentReopen } from "./consent-reopen";
import { CopyrightYear } from "./copyright-year";
import { Logo } from "./logo";
import { StaffLoginLink } from "./site-header";

/**
 * The WordPress footer was one copyright line on #212121 (audit §2.12). Same ground, now carrying what a buyer
 * looks for at the bottom of a page: how to reach TDL, the services, the company pages, the Paytrail staff login
 * portal (change 1), social links, and the legal pages.
 */
export function SiteFooter() {
  const { address } = company;
  return (
    <footer className="on-dark bg-coal text-on-dark-muted">
      <div className="container-site grid gap-12 py-16 lg:grid-cols-[1.3fr_1fr_1fr_0.8fr] lg:gap-10 lg:py-20">
        <div>
          <Logo onDark />
          <address className="mt-8 not-italic leading-relaxed">
            {address.street}, {address.locality}, {address.region}, Nigeria
            <br />
            <a href={company.phoneHref} className="text-white hover:underline">
              {company.phone}
            </a>
            <br />
            <a href={`mailto:${company.email}`} className="text-white hover:underline">
              {company.email}
            </a>
          </address>
          <PartnerCta location="footer" size="md" className="mt-8" />
        </div>

        <FooterList title="Services" items={services.map((s) => ({ href: `/services/${s.slug}`, label: s.name }))} />

        <div>
          <FooterList
            title="Company"
            items={[
              { href: "/about-us", label: "About" },
              { href: "/work", label: "Work" },
              { href: "/careers", label: "Careers" },
              { href: "/certifications", label: "Certifications" },
              { href: "/contact-us", label: "Contact" },
              { href: "/become-a-client", label: "Become a client" },
            ]}
          />
          <StaffLoginLink label={company.staffPortal.footerLabel} className="mt-6 inline-block font-bold text-white" />
        </div>

        <FooterList
          title="Follow"
          items={[
            { href: company.social.linkedin, label: "LinkedIn", external: true },
            { href: company.social.instagram, label: "Instagram", external: true },
            { href: company.social.x, label: "X", external: true },
            // TODO(client): Q4 — labelled Facebook because that is where it goes.
            { href: company.social.facebook, label: "Facebook", external: true },
          ]}
        />
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear /> {company.name}. {company.iso} certified.
          </p>
          <p className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-white hover:underline">
              Privacy policy
            </Link>
            <Link href="/cookies-policy" className="hover:text-white hover:underline">
              Cookies policy
            </Link>
            <ConsentReopen />
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: { href: string; label: string; external?: boolean }[] }) {
  return (
    <div>
      <h2 className="text-base font-bold text-white">{title}</h2>
      <ul className="mt-5 space-y-2.5">
        {items.map((i) => (
          <li key={i.href}>
            {i.external ? (
              <a href={i.href} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                {i.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <Link href={i.href} className="hover:text-white hover:underline">
                {i.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
