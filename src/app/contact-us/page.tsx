import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { company, process } from "@/content/facts";
import { BrochureQr } from "@/components/contact/brochure-qr";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { PartnerCta } from "@/components/ui/partner-cta";

export const metadata: Metadata = {
  title: "Contact",
  description: `Total Data Limited, ${company.address.street}, ${company.address.locality}, ${company.address.region}. ${company.phone}. ${company.email}.`,
  alternates: { canonical: "/contact-us" },
};

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${company.name}, ${company.address.street}, ${company.address.locality}, ${company.address.region}, Nigeria`,
)}`;

const link = "font-bold text-accent-strong underline underline-offset-4";

/**
 * Direct lines first (a Nigerian enterprise buyer often reaches for WhatsApp or the phone before a form), then the
 * brochure QR (change 7). The address links out to Google Maps rather than embedding one: no third-party script, no
 * iframe, nothing that runs before consent. The enquiry form stays on its own page.
 */
export default function ContactPage() {
  const lines: { icon: LucideIcon; title: string; body: ReactNode }[] = [
    {
      icon: Phone,
      title: "Phone",
      body: (
        <a href={company.phoneHref} className={link}>
          {company.phone}
        </a>
      ),
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      body: (
        <a href={company.whatsappHref} target="_blank" rel="noopener noreferrer" className={link}>
          Message {company.phone}
          <span className="sr-only"> (opens WhatsApp)</span>
        </a>
      ),
    },
    {
      icon: Mail,
      title: "Email",
      body: (
        <a href={`mailto:${company.email}`} className={`${link} break-all`}>
          {company.email}
        </a>
      ),
    },
    {
      icon: MapPin,
      title: "Office",
      body: (
        <address className="not-italic">
          {company.address.street}, {company.address.locality}, {company.address.region}
          <br />
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={link}>
            Open in Google Maps<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </address>
      ),
    },
  ];
  return (
    <main id="main">
      <JsonLd include={["localBusiness"]} />
      <PageHeader eyebrow="Contact" title="Call, message, or come to" accent="Ilupeju." lead={process.responsePromise} actions={<PartnerCta location="contact" />} />

      <section aria-label="Ways to reach us" className="bg-white">
        <div className="container-site section-y">
          <Reveal as="ul" items=":scope > li" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {lines.map(({ icon: Icon, title, body }) => (
              <li key={title} className="h-full rounded-lg bg-white p-7 shadow-[0_15px_40px_rgb(15_23_42/0.08)]">
                <Icon className="size-10 text-accent-strong" strokeWidth={1.5} aria-hidden="true" />
                <h2 className="mt-5 font-display text-xl font-medium text-navy">{title}</h2>
                <div className="mt-2">{body}</div>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="brochure-title" className="bg-mist">
        <div className="container-site grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <h2 id="brochure-title" className="text-[2rem] leading-tight lg:text-[2.6875rem]">
              Our <span className="text-accent-strong">brochure</span>
            </h2>
            <p className="mt-5 max-w-[34rem]">The company profile, for your files or your board. Scan the code with a phone, or open it here.</p>
          </div>
          <BrochureQr />
        </div>
      </section>

      <section aria-labelledby="new-client-title" className="on-dark bg-charcoal">
        <div className="container-site py-16 lg:py-20">
          <h2 id="new-client-title" className="text-[2rem] leading-tight text-white lg:text-[2.5rem]">
            New client?
          </h2>
          <p className="mt-5 max-w-[38rem] text-on-dark-muted">
            Message us on WhatsApp with the services you need and roughly how many people are involved, or use the three-step form.{" "}
            {process.responsePromise}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <PartnerCta location="contact" />
            <Link href="/become-a-client" className="font-bold text-white underline decoration-accent-on-dark decoration-2 underline-offset-[6px] hover:text-accent-on-dark">
              Use the form
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
