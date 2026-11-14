import { motion } from "motion/react";

/**
 * Fades and lifts its children into place the first time they scroll into view,
 * so each section arrives as the reader reaches it. Reduced-motion users get the
 * content without movement (handled by <MotionConfig reducedMotion="user"> at the root).
 */
const Reveal = ({ as = "div", delay = 0, y = 24, className, children, ...rest }) => {
  const Component = motion[as] ?? motion.div;

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Reveal;
