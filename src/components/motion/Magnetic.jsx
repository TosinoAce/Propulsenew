import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

const SPRING = { stiffness: 260, damping: 18, mass: 0.5 };

/** Pulls its child a few pixels toward the cursor, giving the main actions a tactile feel. */
const Magnetic = ({ strength = 0.3, className = "", children }) => {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), SPRING);
  const y = useSpring(useMotionValue(0), SPRING);

  const handleMove = (event) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`inline-flex ${className}`}
      style={{ x, y }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
};

export default Magnetic;
