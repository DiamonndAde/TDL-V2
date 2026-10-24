import { BriefcaseBusiness, GraduationCap, Lightbulb, MonitorCog, UserSearch, Users, Wallet, type LucideIcon } from "lucide-react";
import type { ServiceSlug } from "@/content/services";

/** One Lucide icon per service line: brand panels, service pages and cards. */
export const serviceIcons: Record<ServiceSlug, LucideIcon> = {
  "human-resources-outsourcing": Users,
  "business-process-outsourcing": BriefcaseBusiness,
  "recruitment-background-check": UserSearch,
  "learning-and-development": GraduationCap,
  "payroll-management": Wallet,
  "business-advisory": Lightbulb,
  "technology-solutions": MonitorCog,
};
