import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { cookiesPolicy } from "@/content/legal";

export const metadata: Metadata = {
  title: "Cookies policy",
  description: "How the Total Data Limited website uses cookies, and how to manage them.",
  alternates: { canonical: "/cookies-policy" },
};

// Verbatim from the original site; TODO(client): Q25 — legal review before launch.
export default function CookiesPolicyPage() {
  return <LegalPage title="Cookies policy" blocks={cookiesPolicy} />;
}
