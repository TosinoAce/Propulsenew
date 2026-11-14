import { FileSearch, PhoneCall, SlidersHorizontal } from "lucide-react";
import Reveal from "../Reveal";

const STEPS = [
  {
    icon: SlidersHorizontal,
    title: "Search by location, type and budget",
    text: "Filter every listing down to the state, property type and price range that suit you.",
  },
  {
    icon: FileSearch,
    title: "Open a listing for the full picture",
    text: "See the price, size, amenities and a clear description before you make a single call.",
  },
  {
    icon: PhoneCall,
    title: "Reach the realtor directly",
    text: "Send an inquiry, call, or start a WhatsApp chat with the realtor handling the property.",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="bg-tint">
    <div className="shell grid gap-12 py-24 lg:grid-cols-[1fr_1.3fr] lg:gap-20 lg:py-28">
      <Reveal className="lg:sticky lg:top-28 lg:self-start">
        <h2 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">
          From first search to first conversation
        </h2>
        <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-muted">
          Propulse keeps the path short. Three steps take you from browsing to speaking with a
          realtor.
        </p>
      </Reveal>

      <ol className="flex flex-col">
        {STEPS.map((step, index) => (
          <Reveal
            as="li"
            key={step.title}
            delay={index * 0.1}
            className="flex gap-6 border-t border-line py-9 first:border-t-0 first:pt-0 last:pb-0"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-panel text-accent-deep shadow-card">
              <step.icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-ink">{step.title}</h3>
              <p className="mt-2 max-w-[52ch] leading-relaxed text-muted">{step.text}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  </section>
);

export default HowItWorks;
