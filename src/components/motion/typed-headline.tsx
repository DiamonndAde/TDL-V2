import type { CSSProperties } from "react";

/**
 * The hero headline with its second sentence typed, as WordPress typed "Scale Your" (audit §5), without its faults:
 *  - the full sentence is in the server HTML (a visually hidden copy), so crawlers and screen readers get all of
 *    it; WordPress's typed words were missing from the source;
 *  - the typing is CSS keyed to first paint (`.typed-headline` in globals.css), so nothing waits for hydration;
 *  - under reduced motion the words are simply there.
 * Each character carries its index; a caret (a box-shadow strip, so layout never moves) rides on whichever
 * character appeared last and blinks a few times at the end.
 */
export function TypedHeadline({ lead, typed, id }: { lead: string; typed: string; id?: string }) {
  const words = typed.split(" ");
  const total = typed.replace(/ /g, "").length + words.length - 1;
  let i = 0;
  const ch = (c: string, key: string) => {
    const index = i++;
    return (
      <span key={key} className={index === total - 1 ? "tc tc-last" : "tc"} style={{ "--i": index } as CSSProperties}>
        {c}
      </span>
    );
  };
  return (
    <h1 id={id} className="text-[2.5rem] leading-[1.12] text-white sm:text-5xl lg:text-[3.5rem]">
      <span className="sr-only">
        {lead} {typed}
      </span>
      <span aria-hidden="true" className="block">
        {lead}
      </span>
      <span aria-hidden="true" className="typed-headline block text-accent-on-dark">
        {words.map((w, wi) => (
          <span key={wi}>
            {/* A word never breaks across lines; the space after it is where lines may wrap. */}
            <span className="whitespace-nowrap">{[...w].map((c, ci) => ch(c, `${wi}-${ci}`))}</span>
            {wi < words.length - 1 ? ch(" ", `${wi}-s`) : null}
          </span>
        ))}
      </span>
    </h1>
  );
}
