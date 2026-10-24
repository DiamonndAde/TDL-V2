/**
 * Initials for a named person's frame until a real headshot exists (Q18, Q26): navy, lime initials in Space Grotesk.
 * Never a face: a stock or generated face under a real name manufactures a likeness (AGENTS.md, Imagery). Shown in
 * every build, like the brand panels; honorifics are dropped ("Mr. Michael Kehinde" → MK).
 */
const HONORIFICS = new Set(["mr", "mrs", "ms", "miss", "dr", "prof", "engr", "chief", "alhaji", "alhaja", "barr", "esq"]);

export function initialsOf(name: string) {
  const words = name
    .replace(/\./g, "")
    .split(/\s+/)
    .filter((w) => w && !HONORIFICS.has(w.toLowerCase()));
  if (words.length === 0) return "";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function Monogram({ name, size = 96, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-lg bg-navy font-display font-bold text-accent-on-dark ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initialsOf(name)}
    </span>
  );
}
