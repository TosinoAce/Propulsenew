import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * The brand's symbol drawn as lines: a roofline (property) over a heartbeat (pulse).
 * With `animate` the lines draw themselves; otherwise it is a still mark.
 * `roof` sets the roof colour so the mark works on light and dark surfaces.
 */
const BrandMark = ({ animate = false, roof = "currentColor", className = "" }) => {
  const draw = (duration, delay) =>
    animate
      ? { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration, delay, ease: EASE } }
      : {};

  return (
    <svg viewBox="0 0 240 130" className={className} fill="none" aria-hidden="true">
      <motion.path
        d="M24 76 L120 22 L216 76"
        stroke={roof}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(0.9, 0.1)}
      />
      <motion.path
        d="M170 50 V30 H186 V59"
        stroke={roof}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(0.5, 0.6)}
      />
      <motion.path
        d="M24 106 H86 L99 82 L115 124 L131 88 L141 106 H216"
        stroke="var(--color-accent)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(1, 0.7)}
      />
    </svg>
  );
};

export default BrandMark;
