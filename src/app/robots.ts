import type { MetadataRoute } from "next";
import { company } from "@/content/facts";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${company.siteUrl}/sitemap.xml`,
  };
}
