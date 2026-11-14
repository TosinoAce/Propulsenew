import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const Word = ({ progress, range, children }) => {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return <motion.span style={{ opacity }}>{children} </motion.span>;
};

/**
 * A statement whose words darken one after another as the reader scrolls through it,
 * so the sentence is read at the pace of the scroll.
 */
const ScrollText = ({ text, className = "" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => (
        <Word
          key={`${word}-${index}`}
          progress={scrollYProgress}
          range={[index / words.length, (index + 1) / words.length]}
        >
          {word}
        </Word>
      ))}
    </p>
  );
};

export default ScrollText;
