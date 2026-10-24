import { legalUpdated, type LegalBlock } from "@/content/legal";
import { PageHeader } from "@/components/layout/page-header";

/**
 * A policy rendered verbatim from src/content/legal.ts (TODO(client): Q25 — legal review before launch; no wording
 * changes here without it). Numbered section lines are headings; consecutive list items form one list. Server-only,
 * no motion: legal pages carry the smallest possible bundle.
 */
export function LegalPage({ title, blocks }: { title: string; blocks: LegalBlock[] }) {
  const groups: (LegalBlock | LegalBlock[])[] = [];
  for (const b of blocks) {
    const last = groups[groups.length - 1];
    if (b.type === "li") {
      if (Array.isArray(last)) last.push(b);
      else groups.push([b]);
    } else groups.push(b);
  }
  return (
    <main id="main">
      <PageHeader title={title} lead={`Last updated ${legalUpdated}.`} />
      <article className="bg-white">
        <div className="container-site max-w-[52rem] space-y-4 py-14 leading-relaxed lg:py-20">
          {groups.map((g, i) =>
            Array.isArray(g) ? (
              <ul key={i} className="list-disc space-y-2 pl-6 marker:text-accent-strong">
                {g.map((li) => (
                  <li key={li.text}>{li.text}</li>
                ))}
              </ul>
            ) : g.type === "h2" ? (
              <h2 key={i} className="pt-6 text-xl text-navy">
                {g.text}
              </h2>
            ) : (
              <p key={i}>{g.text}</p>
            ),
          )}
        </div>
      </article>
    </main>
  );
}
