import { ArrowRight } from "lucide-react";
import Button from "./button";
import Reveal from "./Reveal";
import Magnetic from "./motion/Magnetic";
import { useAuth } from "../auth/AuthContext";

/** Closing call to action shared by the marketing pages. */
const CtaBand = () => {
  const { user } = useAuth();

  return (
    <section className="shell pt-24">
      <Reveal className="flex flex-col items-start gap-8 rounded-3xl bg-accent-soft p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-16">
        <div>
          <h2 className="text-3xl font-semibold tracking-tighter text-ink sm:text-4xl lg:text-5xl">
            Ready to find your place?
          </h2>
          <p className="mt-4 max-w-[48ch] text-lg leading-relaxed text-ink-soft">
            {user
              ? "Pick up where you left off and see what is on the market today."
              : "Create a free account to save listings and reach realtors in a tap."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {user ? (
            <Magnetic>
              <Button to="/property" size="lg">
                Browse properties
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </Button>
            </Magnetic>
          ) : (
            <>
              <Magnetic><Button to="/signup" size="lg">Get started</Button></Magnetic>
              <Button to="/property" variant="secondary" size="lg">Browse properties</Button>
            </>
          )}
        </div>
      </Reveal>
    </section>
  );
};

export default CtaBand;
