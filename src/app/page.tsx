import { AboutBlock } from "@/components/home/about-block";
import { FiguresStrip } from "@/components/home/figures-strip";
import { Hero } from "@/components/home/hero";
import { QuotePanel } from "@/components/home/quote-panel";
import { ServiceRows } from "@/components/home/service-rows";

/** The WordPress home page, in its order (docs/PLAN.md §3). Testimonials, logos and Why TDL land in step 6. */
export default function Home() {
  return (
    <main id="main">
      <Hero />
      <FiguresStrip />
      <AboutBlock />
      <QuotePanel />
      <ServiceRows />
    </main>
  );
}
