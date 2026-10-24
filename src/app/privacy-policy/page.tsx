import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { privacyPolicy } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Total Data Limited collects, uses and protects personal data under the Nigeria Data Protection Regulations.",
  alternates: { canonical: "/privacy-policy" },
};

// Verbatim from the original site; TODO(client): Q25 — legal review before launch.
export default function PrivacyPolicyPage() {
  return <LegalPage title="Privacy policy" blocks={privacyPolicy} />;
}
