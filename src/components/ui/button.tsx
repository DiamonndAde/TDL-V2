import type { ComponentProps, ReactNode } from "react";

/**
 * A form button: `primary` is the accent pill (the site's buttons without the arrow, which belongs to links that go
 * somewhere); `link` is the quiet secondary action.
 */
export function Button({ variant = "primary", className = "", children, ...props }: ComponentProps<"button"> & { variant?: "primary" | "link"; children: ReactNode }) {
  const cls =
    variant === "primary"
      ? "inline-flex h-12 items-center justify-center rounded-full bg-accent-strong px-8 font-bold text-white transition-colors hover:bg-accent-strong-hover disabled:opacity-60"
      : "font-bold text-navy underline decoration-2 underline-offset-[6px] hover:text-accent-strong";
  return (
    <button type="button" className={`${cls} ${className}`} {...props}>
      {children}
    </button>
  );
}
