"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav } from "@/content/navigation";

/**
 * The primary links with the current section marked, as the WordPress menu marked HOME in green. Client-side only
 * for `usePathname`; the links themselves are plain anchors in the server HTML.
 */
export function NavLinks({ variant }: { variant: "bar" | "menu" }) {
  const pathname = usePathname();
  return primaryNav.map((n) => {
    const current = pathname === n.href || pathname.startsWith(`${n.href}/`);
    return (
      <Link
        key={n.href}
        href={n.href}
        aria-current={current ? "page" : undefined}
        className={
          variant === "bar"
            ? "text-[0.8125rem] font-bold uppercase tracking-[0.06em] text-navy transition-colors hover:text-accent-strong aria-[current=page]:text-accent-strong"
            : "block border-b border-black/10 py-4 text-lg font-bold text-navy aria-[current=page]:text-accent-strong"
        }
      >
        {n.label}
      </Link>
    );
  });
}
