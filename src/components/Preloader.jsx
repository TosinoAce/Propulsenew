import { useEffect, useRef } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import BrandMark from "./BrandMark";

const EASE = [0.16, 1, 0.3, 1];
const LETTERS = "PROPULSE".split("");

/** How long the opening sequence takes to count to 100, in seconds. */
const PRELOADER_SECONDS = 1.9;

/**
 * Opening screen shown once per page load, on a dark stage:
 * the roof-and-heartbeat mark draws itself, the brand name rises letter by letter,
 * a heartbeat line sweeps the full width of the window, and a counter runs to 100.
 * When the page is ready the stage lifts away with a curved lower edge, like a curtain.
 * Render inside <AnimatePresence>.
 */
const Preloader = () => {
  const counter = useRef(null);
  const reduce = useReducedMotion();

  // The counter writes straight to the page so it never re-renders React
  useEffect(() => {
    const node = counter.current;
    if (!node) return;
    if (reduce) {
      node.textContent = "100";
      return;
    }

    const controls = animate(0, 100, {
      duration: PRELOADER_SECONDS,
      ease: [0.3, 0, 0.2, 1],
      onUpdate: (value) => {
        node.textContent = String(Math.round(value)).padStart(2, "0");
      },
    });
    return () => controls.stop();
  }, [reduce]);

  return (
    <motion.div
      role="status"
      aria-label="Loading Propulse"
      className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-ink text-white"
      exit={{
        y: "-100%",
        borderBottomLeftRadius: "50% 18%",
        borderBottomRightRadius: "50% 18%",
      }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* A heartbeat trace across the whole window, drawn as the page loads */}
      <svg
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-1/2 h-48 w-full -translate-y-1/2 opacity-25"
        fill="none"
        aria-hidden="true"
      >
        <motion.path
          d="M0 100 H430 L465 40 L520 170 L575 55 L610 100 H780 L800 78 L825 122 L845 100 H1200"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: PRELOADER_SECONDS, ease: "easeInOut" }}
        />
      </svg>

      <motion.div
        className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6"
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <BrandMark animate roof="#fdfefd" className="w-28 sm:w-36" />

        {/* Each letter rises out of its own slot */}
        <p className="flex overflow-hidden text-5xl font-semibold tracking-tight sm:text-7xl" aria-hidden="true">
          {LETTERS.map((letter, index) => (
            <motion.span
              key={index}
              className="inline-block"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 + index * 0.06, ease: EASE }}
            >
              {letter}
            </motion.span>
          ))}
        </p>

        <motion.p
          className="text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          Property from verified partners across Nigeria
        </motion.p>
      </motion.div>

      <div className="relative flex items-end justify-between gap-6 px-6 pb-8 sm:px-10">
        <p className="text-sm uppercase tracking-[0.18em] text-white/50">Loading</p>
        <p className="text-6xl font-semibold leading-none tracking-tighter tabular-nums sm:text-8xl">
          <span ref={counter}>00</span>
          <span className="text-accent">%</span>
        </p>
      </div>

      {/* Progress along the bottom edge */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1 origin-left bg-accent"
        initial={{ scaleX: reduce ? 1 : 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: reduce ? 0 : PRELOADER_SECONDS, ease: [0.3, 0, 0.2, 1] }}
      />
    </motion.div>
  );
};

export default Preloader;
