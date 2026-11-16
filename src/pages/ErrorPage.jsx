import { useRef } from "react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { motion } from "motion/react";
import { House, RotateCw } from "lucide-react";
import Button from "../components/button";
import NotFound from "./NotFound";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Shown when a page crashes. The picture is a house knocked off level: it hangs crooked,
 * swings when it appears, and can be dragged around before it settles back.
 * It deliberately avoids the shared layout, so a fault there cannot break this page too.
 */
const ErrorPage = () => {
  const error = useRouteError();
  const frame = useRef(null);

  // A missing route raised by the router is a "not found", not a crash
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;

  console.error("Page error:", error);

  const detail = import.meta.env.DEV ? error?.message ?? String(error) : null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-surface">
      <header className="shell flex h-[72px] items-center">
        <Link to="/" aria-label="Propulse home">
          <img src="/propulseLogo.png" alt="Propulse" className="h-14 w-auto" />
        </Link>
      </header>

      <main className="shell grid flex-1 items-center gap-12 pb-16 pt-6 lg:grid-cols-2 lg:gap-20">
        <div
          ref={frame}
          className="relative flex aspect-square max-h-[28rem] w-full items-center justify-center overflow-hidden rounded-3xl bg-accent-soft"
        >
          {/* The ground line the house should be sitting on */}
          <div aria-hidden="true" className="absolute inset-x-10 bottom-[26%] h-1 rounded-full bg-ink/15" />

          <motion.div
            drag
            dragConstraints={frame}
            dragElastic={0.25}
            dragSnapToOrigin
            whileDrag={{ scale: 1.08, cursor: "grabbing" }}
            initial={{ rotate: 0, y: -60, opacity: 0 }}
            animate={{ rotate: [0, -22, -9, -16, -13], y: 0, opacity: 1 }}
            transition={{ duration: 1.6, ease: EASE, times: [0, 0.35, 0.6, 0.8, 1] }}
            className="flex size-40 cursor-grab origin-bottom-left items-center justify-center rounded-3xl bg-ink text-accent shadow-lift sm:size-48"
            aria-hidden="true"
          >
            <House className="size-20 sm:size-24" strokeWidth={1.5} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        >
          <h1 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl lg:text-6xl">
            Something slipped off its foundation
          </h1>
          <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-muted">
            This page ran into a problem and could not finish loading. Your account and saved
            properties are safe. Reloading usually sets things straight.
          </p>

          {detail && (
            <pre className="mt-6 max-h-40 overflow-auto rounded-2xl bg-tint p-4 text-sm text-ink-soft">
              {detail}
            </pre>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => window.location.reload()}>
              <RotateCw className="size-4" strokeWidth={2} aria-hidden="true" />
              Reload page
            </Button>
            <Button href="/" variant="secondary" size="lg">Back to home</Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ErrorPage;
