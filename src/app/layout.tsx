import type { Metadata, Viewport } from "next";
import { Lato, Space_Grotesk } from "next/font/google";
import { JsonLd } from "@/components/seo/json-ld";
import { company } from "@/content/facts";
import "./globals.css";

// Every page is static: any request-time rendering fails the build (AGENTS.md, Stack).
export const ensureStatic = "navigation";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// Testimonial text, figures and the Why-TDL cards only, as on the WordPress site (audit §4).
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: {
    default: `${company.name} — HR outsourcing, payroll and recruitment in Nigeria`,
    template: `%s | ${company.name}`,
  },
  description: company.description,
  openGraph: {
    siteName: company.name,
    locale: "en_NG",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-accent picks the accent palette in globals.css: "green" (approved) or "olive".
    <html lang="en-NG" data-accent="green" className={`${lato.variable} ${spaceGrotesk.variable}`}>
      <body>
        {children}
        <JsonLd />
      </body>
    </html>
  );
}
