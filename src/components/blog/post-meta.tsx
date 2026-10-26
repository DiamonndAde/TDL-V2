/** "26 October 2026 · 3 min read". Formatted at build time in UTC, so it reads the same everywhere. ink/85, not
 * ink/70: on the mist header 70% failed AA contrast (axe, 2026-10-26). */
export function PostMeta({ date, minutes, className = "" }: { date: string; minutes: number; className?: string }) {
  const label = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
  return (
    <p className={`text-sm text-ink/85 ${className}`}>
      <time dateTime={date}>{label}</time>
      <span aria-hidden="true"> · </span>
      {minutes} min read
    </p>
  );
}
