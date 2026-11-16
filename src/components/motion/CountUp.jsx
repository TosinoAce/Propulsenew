import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/** Counts from zero to `value` the first time it scrolls into view. */
const CountUp = ({ value, className }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!inView || reduce) {
      node.textContent = String(inView || reduce ? value : 0);
      return;
    }

    // Writes straight to the DOM so the count never re-renders React
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = String(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [inView, reduce, value]);

  return <span ref={ref} className={className}>0</span>;
};

export default CountUp;
