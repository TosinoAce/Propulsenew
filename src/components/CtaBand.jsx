import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Button from "./button";
import Reveal from "./Reveal";
import Magnetic from "./motion/Magnetic";
import { useAuth } from "../auth/AuthContext";
import { responsiveImage } from "../lib/images";

// Three listing photos fanned out like a hand of cards. They spread when the panel is hovered.
const FAN = [
  { src: "/listings/house-09.jpg", rest: { rotate: -9, x: -70, y: 18 }, spread: { rotate: -15, x: -130, y: 26 } },
  { src: "/listings/house-11.jpg", rest: { rotate: 0, x: 0, y: 0 }, spread: { rotate: 0, x: 0, y: -14 } },
  { src: "/listings/house-04.jpg", rest: { rotate: 9, x: 70, y: 18 }, spread: { rotate: 15, x: 130, y: 26 } },
];

const SPRING = { type: "spring", stiffness: 180, damping: 20 };

/** Closing call to action shared by the marketing pages. */
const CtaBand = () => {
  const { user } = useAuth();

  return (
    <section className="shell pt-24">
      <Reveal>
        <motion.div
          initial="rest"
          whileHover="spread"
          animate="rest"
          className="relative grid items-center gap-10 overflow-hidden rounded-3xl bg-accent-soft p-8 sm:p-12 lg:grid-cols-[1.15fr_1fr] lg:p-16"
        >
          {/* Soft rings behind the photos */}
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/2 hidden size-[34rem] -translate-y-1/2 rounded-full border border-accent/30 lg:block" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-4 top-1/2 hidden size-[24rem] -translate-y-1/2 rounded-full border border-accent/30 lg:block" />

          <div className="relative">
            <h2 className="text-4xl font-semibold leading-[1.04] tracking-tighter text-ink sm:text-5xl lg:text-6xl">
              Ready to find your place?
            </h2>
            <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-ink-soft">
              {user
                ? "Pick up where you left off and see what our partners have on the market today."
                : "Create a free account to save listings and reach our partners in a tap."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Magnetic>
                  <Button to="/property" size="lg">
                    Browse properties
                    <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
                  </Button>
                </Magnetic>
              ) : (
                <>
                  <Magnetic>
                    <Button to="/signup" size="lg">
                      Get started
                      <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
                    </Button>
                  </Magnetic>
                  <Button to="/property" variant="secondary" size="lg">Browse properties</Button>
                </>
              )}
            </div>
          </div>

          <div className="relative mx-auto flex h-64 w-full max-w-md items-center justify-center sm:h-72" aria-hidden="true">
            {FAN.map((card, index) => (
              <motion.img
                key={card.src}
                {...responsiveImage(card.src, "200px")}
                alt=""
                loading="lazy"
                variants={{ rest: card.rest, spread: card.spread }}
                transition={SPRING}
                style={{ zIndex: index === 1 ? 2 : 1 }}
                className="absolute aspect-[4/5] w-40 rounded-3xl border-4 border-panel object-cover shadow-lift sm:w-48"
              />
            ))}
          </div>
        </motion.div>
      </Reveal>
    </section>
  );
};

export default CtaBand;
