import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";

/**
 * A panel with a soft light that follows the cursor across it, which makes large
 * coloured tiles feel alive under the pointer. `tone` picks a light that suits the
 * tile's background.
 */
const TONES = {
  light: "rgb(210 134 17 / 0.16)",
  dark: "rgb(255 255 255 / 0.12)",
};

const Spotlight = ({ tone = "light", className = "", children, ...rest }) => {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const opacity = useSpring(0, { stiffness: 180, damping: 28 });
  const background = useMotionTemplate`radial-gradient(360px circle at ${x}px ${y}px, ${TONES[tone]}, transparent 70%)`;

  const handleMove = (event) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
    opacity.set(1);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onPointerMove={handleMove}
      onPointerLeave={() => opacity.set(0)}
      {...rest}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background, opacity }}
      />
      {children}
    </div>
  );
};

export default Spotlight;
