"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * The phone and tablet menu: a native popover opened by `popovertarget`, so it works before hydration, gets
 * light-dismiss and Escape for free, and the browser exposes the expanded state. Two things need script: closing
 * it after a client-side navigation (the header persists across routes), and the polyfill for browsers without
 * the Popover API (iOS before 17), loaded only where it is missing.
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!("popover" in HTMLElement.prototype)) void import("@oddbird/popover-polyfill");
  }, []);

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    // The polyfill marks an open popover with a `:popover-open` class; matches() throws on the pseudo-class
    // where it isn't supported, which is exactly where the polyfill runs.
    let open = el.classList.contains(":popover-open");
    try {
      open ||= el.matches(":popover-open");
    } catch {}
    if (open) el.hidePopover();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        popoverTarget="site-menu"
        aria-controls="site-menu"
        className="menu-toggle -mr-2 grid size-11 place-items-center rounded-md text-accent-strong lg:hidden"
      >
        <Menu className="menu-icon-open" size={28} aria-hidden="true" />
        <X className="menu-icon-close" size={28} aria-hidden="true" />
        <span className="sr-only">Menu</span>
      </button>
      <div
        id="site-menu"
        ref={panel}
        popover="auto"
        className="site-menu fixed inset-x-0 top-(--header-h) bottom-0 m-0 h-auto w-full max-w-none overflow-y-auto border-t border-black/10 bg-white p-0 lg:hidden"
      >
        {children}
      </div>
    </>
  );
}
