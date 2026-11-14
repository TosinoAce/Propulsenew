import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Opening screen shown once per page load. It draws the two halves of the brand:
 * a roofline (property) and a heartbeat line (pulse), then the logo settles in and
 * the whole screen lifts away like a shutter. Render inside <AnimatePresence>.
 */
const Preloader = () => (
  <motion.div
    role="status"
    aria-label="Loading Propulse"
    className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 bg-surface"
    exit={{ y: "-100%" }}
    transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
  >
    <svg viewBox="0 0 240 130" className="w-56 sm:w-72" fill="none" aria-hidden="true">
      {/* Roofline */}
      <motion.path
        d="M24 76 L120 22 L216 76"
        stroke="var(--color-ink)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
      />
      {/* Chimney */}
      <motion.path
        d="M170 50 V30 H186 V59"
        stroke="var(--color-ink)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.55, ease: EASE }}
      />
      {/* Heartbeat */}
      <motion.path
        d="M24 106 H86 L99 82 L115 124 L131 88 L141 106 H216"
        stroke="var(--color-accent)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: 0.5, ease: "easeInOut" }}
      />
      {/* A bright dot rides the heartbeat while the page gets ready */}
      <motion.circle
        r="5"
        fill="var(--color-accent)"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0], cx: [24, 99, 131, 216], cy: [106, 82, 88, 106] }}
        transition={{ duration: 1.1, delay: 1.3, repeat: Infinity, repeatDelay: 0.25, ease: "easeInOut" }}
      />
    </svg>

    <motion.img
      src="/propulseLogo.png"
      alt=""
      className="h-14 w-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.9, ease: EASE }}
    />
  </motion.div>
);

export default Preloader;
