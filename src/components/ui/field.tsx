import type { ComponentProps, ReactNode } from "react";

/**
 * Native form primitives (ported from v1, restyled for v2). Native controls on purpose: on the phones this audience
 * uses, the OS picker for a <select> beats any JS listbox. Every control has a visible label; an error is inline text
 * that says how to fix it, in #B3261E (6.6:1 on white). Focus is the site-wide :focus-visible ring.
 */
const control =
  "block w-full rounded-md border border-navy/20 bg-white px-4 py-3 text-base text-navy placeholder:text-ink/50 " +
  "focus:border-accent-strong aria-[invalid=true]:border-[#B3261E]";

export function Field({ label, hint, error, htmlFor, children }: { label: string; hint?: string; error?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block font-bold text-navy">
        {label}
      </label>
      {hint ? (
        <p id={`${htmlFor}-hint`} className="mt-1 text-sm text-ink/75">
          {hint}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-sm text-[#B3261E]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className = "", invalid, ...props }: ComponentProps<"input"> & { invalid?: boolean }) {
  return <input aria-invalid={invalid || undefined} className={`${control} ${className}`} {...props} />;
}

export function Select({ className = "", invalid, children, ...props }: ComponentProps<"select"> & { invalid?: boolean }) {
  return (
    <select aria-invalid={invalid || undefined} className={`${control} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className = "", invalid, ...props }: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return <textarea aria-invalid={invalid || undefined} className={`${control} min-h-[7rem] ${className}`} {...props} />;
}

/** A checkbox or radio row: the whole row is the hit target, the control stays native. */
export function ChoiceRow({ type, label, description, ...props }: ComponentProps<"input"> & { type: "checkbox" | "radio"; label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border-b border-navy/10 py-3.5 has-[:checked]:text-accent-strong">
      <input type={type} className="mt-1 size-4 shrink-0 accent-[var(--accent-strong)]" {...props} />
      <span>
        <span className="block font-bold">{label}</span>
        {description ? <span className="block text-sm text-ink/75">{description}</span> : null}
      </span>
    </label>
  );
}
