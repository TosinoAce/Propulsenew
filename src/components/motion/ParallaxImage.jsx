import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { SIZES, responsiveImage } from "../../lib/images";

/**
 * A framed photo that drifts inside its frame as the page scrolls, adding depth.
 * `shift` is how far the photo travels, as a percentage of its own height.
 */
const ParallaxImage = ({ src, alt = "", shift = 8, className = "", imgClassName = "", sizes = SIZES.half, ...rest }) => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const travel = reduce ? 0 : shift;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${travel}%`, `${travel}%`]);

  return (
    <div ref={ref} className={`overflow-hidden rounded-3xl bg-tint ${className}`}>
      <motion.img
        {...responsiveImage(src, sizes)}
        alt={alt}
        decoding="async"
        style={{ y, scale: 1 + (travel * 2) / 100 }}
        className={`size-full object-cover ${imgClassName}`}
        {...rest}
      />
    </div>
  );
};

export default ParallaxImage;
