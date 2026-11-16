import { motion, useScroll, useSpring } from "motion/react";

/** Thin accent bar across the top of the window that fills as the page is read. */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-accent"
      style={{ scaleX }}
    />
  );
};

export default ScrollProgress;
