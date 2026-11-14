import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import MainLayout from "../layout/MainLayout";
import Button from "../components/button";
import Magnetic from "../components/motion/Magnetic";

const EASE = [0.16, 1, 0.3, 1];

/**
 * "Page not found" as an unlit plot at night. The cursor is a torch: wherever it points,
 * the plot number lights up in amber. On touch screens, and for people who prefer reduced
 * motion, the number is simply lit.
 */
const NotFound = () => {
  const reduce = useReducedMotion();
  const plot = useRef(null);
  // The torch only makes sense with a mouse; other devices see the number fully lit
  const [hasMouse, setHasMouse] = useState(false);
  const x = useSpring(useMotionValue(0), { stiffness: 160, damping: 22 });
  const y = useSpring(useMotionValue(0), { stiffness: 160, damping: 22 });
  const torch = useMotionTemplate`radial-gradient(260px circle at ${x}px ${y}px, black 20%, transparent 75%)`;

  const handleMove = (event) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  };

  // Start the torch in the middle so the number is partly lit before the cursor arrives
  useEffect(() => {
    setHasMouse(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    if (!plot.current) return;
    x.jump(plot.current.offsetWidth / 2);
    y.jump(plot.current.offsetHeight / 2);
  }, [x, y]);

  const useTorch = hasMouse && !reduce;

  const digits = "select-none text-[34vw] font-semibold leading-none tracking-tighter sm:text-[15rem] lg:text-[19rem]";

  return (
    <MainLayout>
      <section className="shell pt-28">
        <motion.div
          ref={plot}
          onPointerMove={handleMove}
          className="relative flex min-h-[26rem] items-center justify-center overflow-hidden rounded-3xl bg-ink sm:min-h-[30rem]"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {/* The plot grid, barely visible in the dark */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:4.5rem_4.5rem]"
          />

          <p aria-hidden="true" className={`${digits} text-white/[0.07]`}>404</p>

          {/* The lit copy of the number, visible only inside the torch beam */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
            style={useTorch ? { maskImage: torch, WebkitMaskImage: torch } : undefined}
          >
            <p className={`${digits} text-accent`}>404</p>
          </motion.div>
        </motion.div>

        <motion.div
          className="mx-auto flex max-w-xl flex-col items-center pt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
        >
          <h1 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">
            This plot is off the map
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            We searched the whole estate and could not find the page you asked for. It may have
            moved, or the address may be mistyped.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Magnetic><Button to="/" size="lg">Back to home</Button></Magnetic>
            <Button to="/property" variant="secondary" size="lg">Browse properties</Button>
          </div>
        </motion.div>
      </section>
    </MainLayout>
  );
};

export default NotFound;
