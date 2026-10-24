import type { MetadataRoute } from "next";
import { company } from "@/content/facts";
import { services } from "@/content/services";

const base = company.siteUrl;

/**
 * No lastModified: under Cache Components a `new Date()` here makes the route render per request, and "modified
 * at build time" would be false for pages that did not change. Search engines ignore an untrustworthy date anyway.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/services",
    "/work",
    "/about-us",
    "/careers",
    "/contact-us",
    "/become-a-client",
    "/certifications",
    "/privacy-policy",
    "/cookies-policy",
  ];
  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path === "/become-a-client" ? 0.9 : 0.7,
    })),
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
