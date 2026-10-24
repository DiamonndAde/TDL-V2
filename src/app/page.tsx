import { AboutBlock } from "@/components/home/about-block";
import { ClientLogos } from "@/components/home/client-logos";
import { FiguresStrip } from "@/components/home/figures-strip";
import { Hero } from "@/components/home/hero";
import { QuotePanel } from "@/components/home/quote-panel";
import { ServiceRows } from "@/components/home/service-rows";
import { Testimonials } from "@/components/home/testimonials";
import { WhyTdl } from "@/components/home/why-tdl";

/** The WordPress home page, in its order (docs/PLAN.md §3). */
export default function Home() {
  return (
    <main id="main">
      <Hero />
      <FiguresStrip />
      <AboutBlock />
      <QuotePanel />
      <ServiceRows />
      <Testimonials />
      <ClientLogos />
      <WhyTdl />
    </main>
  );
}
