import type { ReactNode } from "react";

/**
 * The inner-page header (docs/PLAN.md §3): a mist band with the page's one H1, a lead and optional actions, plus an
 * optional frame beside it from lg. WordPress had no inner pages to copy, so this takes the home page's own parts:
 * the mist of the quote panel, Lato headings with one accent phrase in `accent-strong`, the pill buttons.
 * Above the fold, so nothing here animates.
 */
export function PageHeader({
  eyebrow,
  title,
  accent,
  lead,
  actions,
  aside,
  id = "page-title",
}: {
  /** A short label above the H1, e.g. the service name when the H1 is what it does. */
  eyebrow?: string;
  title: ReactNode;
  /** An accent phrase appended to the title. */
  accent?: string;
  lead?: ReactNode;
  actions?: ReactNode;
  /** A frame or panel beside the text from lg (below it on smaller screens). */
  aside?: ReactNode;
  id?: string;
}) {
  return (
    <header className="bg-mist">
      <div className={`container-site py-14 lg:py-20 ${aside ? "grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16" : ""}`}>
        <div className="max-w-3xl">
          {eyebrow ? <p className="mb-4 text-sm font-bold tracking-[0.06em] text-accent-strong uppercase">{eyebrow}</p> : null}
          <h1 id={id} className="text-[2.25rem] leading-[1.15] sm:text-[2.75rem] lg:text-[3.25rem]">
            {title}
            {accent ? (
              <>
                {" "}
                <span className="text-accent-strong">{accent}</span>
              </>
            ) : null}
          </h1>
          {lead ? <div className="mt-6 max-w-[40rem] text-[1.0625rem] leading-relaxed lg:text-lg">{lead}</div> : null}
          {actions ? <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">{actions}</div> : null}
        </div>
        {aside}
      </div>
    </header>
  );
}
