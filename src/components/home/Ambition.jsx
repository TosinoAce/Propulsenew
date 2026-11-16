import { ArrowRight, BadgeCheck, FileCheck2, MessagesSquare } from "lucide-react";
import Button from "../button";
import Reveal from "../Reveal";
import ParallaxImage from "../motion/ParallaxImage";
import ScrollText from "../motion/ScrollText";
import Spotlight from "../motion/Spotlight";

const COMMITMENTS = [
  {
    icon: BadgeCheck,
    title: "Verified partners only",
    text: "No open listings. Every property comes from a firm we have checked.",
  },
  {
    icon: FileCheck2,
    title: "Titles stated up front",
    text: "Each listing shows its title document before you make contact.",
  },
  {
    icon: MessagesSquare,
    title: "Straight to the source",
    text: "You speak to the partner directly, with no one in between.",
  },
];

/**
 * The company's ambition: a dark panel where the statement lights up word by word as the
 * reader scrolls, beside a photo that drifts in its frame, closed by three commitments.
 */
const Ambition = () => (
  <section className="shell py-24 lg:py-28">
    <Spotlight tone="dark" className="rounded-3xl bg-ink text-white">
      <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14 lg:p-14">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">Our ambition</p>
            <ScrollText
              className="mt-6 text-3xl font-medium leading-[1.18] tracking-tight sm:text-4xl lg:text-5xl"
              text="We want owning property in Nigeria to feel simple and transparent, with every listing in one place and a verified partner one message away."
            />
          </div>
          <Reveal>
            <Button to="/about" variant="accent" size="lg">
              About Propulse
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </Button>
          </Reveal>
        </div>

        <Reveal className="min-h-72 lg:min-h-[30rem]">
          <ParallaxImage
            src="/photos/lagos-bridge.jpg"
            alt="The Lekki-Ikoyi Link Bridge in Lagos under a pale evening sky"
            className="size-full !bg-ink-soft"
            shift={7}
            loading="lazy"
          />
        </Reveal>
      </div>

      <ul className="relative grid border-t border-white/15 md:grid-cols-3">
        {COMMITMENTS.map((commitment, index) => (
          <Reveal
            as="li"
            key={commitment.title}
            delay={index * 0.08}
            className="border-white/15 p-6 sm:p-10 md:border-l md:first:border-l-0 max-md:border-t max-md:first:border-t-0"
          >
            <commitment.icon className="size-7 text-accent" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="mt-5 text-xl font-semibold tracking-tight">{commitment.title}</h3>
            <p className="mt-2 max-w-[36ch] leading-relaxed text-white/70">{commitment.text}</p>
          </Reveal>
        ))}
      </ul>
    </Spotlight>
  </section>
);

export default Ambition;
