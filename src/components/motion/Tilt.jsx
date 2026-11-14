import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

const SPRING = { stiffness: 220, damping: 22, mass: 0.6 };

/**
 * Leans its content toward the cursor and moves a soft highlight with it, so cards
 * respond to the pointer like physical objects. Mouse only: touch and pen are ignored.
 * Values live in motion values, so pointer movement never re-renders React.
 */
const Tilt = ({ max = 7, glare = true, className = "", children, ...rest }) => {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);

  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), SPRING);
  const glareOpacity = useSpring(hover, { stiffness: 200, damping: 30 });
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glareBackground = useMotionTemplate`radial-gradient(420px circle at ${glareX} ${glareY}, rgb(255 255 255 / 0.28), transparent 60%)`;

  const handleMove = (event) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
    hover.set(1);
  };

  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  };

  return (
    <div className={className} style={{ perspective: 1000 }} {...rest}>
      <motion.div
        className="relative h-full"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-3xl mix-blend-soft-light"
            style={{ background: glareBackground, opacity: glareOpacity }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Tilt;
