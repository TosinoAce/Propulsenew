import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, BadgeCheck, MapPin, Search } from "lucide-react";
import Button from "../button";
import Magnetic from "../motion/Magnetic";
import Select from "../Select";
import { PROPERTY_TYPES, stateSlug } from "../../lib/constants";
import { SIZES, responsiveImage } from "../../lib/images";

const EASE = [0.16, 1, 0.3, 1];
const SLIDE_SECONDS = 6;

// The opening photo. It is a local file (preloaded in index.html), so it can appear at once
// instead of waiting for the listings to arrive; the listings follow it in the rotation.
const HERO_INTRO_IMAGE = "/listings/house-11.jpg";
const INTRO_SLIDE = { id: null, propertyImage: HERO_INTRO_IMAGE };

// The headline, text and actions arrive one after another so the eye lands on them in order
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

/**
 * Opening section of the home page: a large photo stage that steps through real listings,
 * with the headline over it and the search bar docked to its bottom edge.
 * `slides` are listings from the catalog; the stage links to whichever one is showing.
 */
const Hero = ({ slides = [], states = [] }) => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [index, setIndex] = useState(0);

  const stage = [INTRO_SLIDE, ...slides.filter((slide) => slide.propertyImage !== HERO_INTRO_IMAGE)];
  const active = index % stage.length;
  const current = stage[active];

  // Move to the next listing every few seconds. Choosing one by hand restarts the wait.
  useEffect(() => {
    if (reduce || stage.length < 2) return;
    const timer = setTimeout(() => setIndex((value) => (value + 1) % stage.length), SLIDE_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [active, reduce, stage.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (price) params.set("price", price);
    const query = params.toString() ? `?${params}` : "";
    // A chosen state opens that state's own page
    navigate(location ? `/property/in/${stateSlug(location)}${query}` : `/property${query}`);
  };

  return (
    <section className="shell pt-[84px]">
      <div className="relative flex min-h-[min(76dvh,46rem)] flex-col justify-between overflow-hidden rounded-3xl bg-ink">
        {/* Photo stage: each listing fades in while slowly settling back */}
        <AnimatePresence initial={false}>
          <motion.img
            key={current.propertyImage}
            {...responsiveImage(current.propertyImage, SIZES.full)}
            alt=""
            fetchPriority={active === 0 ? "high" : undefined}
            className="absolute inset-0 size-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.2, ease: "easeInOut" }, scale: { duration: SLIDE_SECONDS + 2, ease: "easeOut" } }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 to-transparent" aria-hidden="true" />

        {/* The listing currently on stage */}
        <div className="relative hidden justify-end p-6 sm:flex">
          <AnimatePresence mode="wait">
            {current.id && (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <Link
                  to={`/property/${current.id}`}
                  className="group flex max-w-[20rem] items-center gap-4 rounded-2xl border border-white/15 bg-ink/60 py-3 pl-4 pr-3 text-white backdrop-blur-md transition-colors duration-300 hover:bg-ink/80"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{current.propertyName}</p>
                    <p className="flex items-center gap-1 truncate text-sm text-white/80">
                      <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      {current.propertyLocation}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm">
                      <span className="font-semibold text-accent">₦{current.propertyPrice}</span>
                      {current.partner?.verified_at && (
                        <BadgeCheck className="size-4 text-white/80" strokeWidth={2} aria-label="Verified partner" />
                      )}
                    </p>
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-transform duration-500 ease-out-expo group-hover:rotate-45">
                    <ArrowUpRight className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex flex-col gap-8 p-6 pb-20 sm:p-10 sm:pb-24 lg:flex-row lg:items-end lg:justify-between lg:p-14 lg:pb-24">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl">
            <motion.h1
              variants={item}
              className="text-5xl font-semibold leading-[1.02] tracking-tighter text-white sm:text-6xl lg:text-7xl"
            >
              Find land and homes <span className="text-accent">worth owning.</span>
            </motion.h1>

            <motion.p variants={item} className="mt-5 max-w-[46ch] text-lg leading-relaxed text-white/85">
              Browse listings from verified partners across Nigeria, then talk directly to the
              partner behind each one.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <Button to="/property" variant="accent" size="lg">
                  Browse properties
                  <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
                </Button>
              </Magnetic>
              <Button
                href="#how-it-works"
                variant="ghost"
                size="lg"
                className="border border-white/40 !text-white hover:!bg-white/15"
              >
                How it works
              </Button>
            </motion.div>
          </motion.div>

          {/* One bar per listing; the active one fills while it is on stage */}
          {stage.length > 1 && (
            <div className="flex gap-2" role="group" aria-label="Featured listings">
              {stage.map((slide, position) => (
                <button
                  key={slide.id ?? "intro"}
                  type="button"
                  onClick={() => setIndex(position)}
                  aria-label={slide.id ? `Show ${slide.propertyName}` : "Show the opening photo"}
                  aria-current={position === active ? "true" : undefined}
                  className="group flex h-8 w-12 items-center"
                >
                  <span className="relative h-1 w-full overflow-hidden rounded-full bg-white/30 transition-colors duration-300 group-hover:bg-white/50">
                    {position === active && (
                      <motion.span
                        key={`${slide.id}-${index}`}
                        className="absolute inset-0 origin-left rounded-full bg-accent"
                        initial={{ scaleX: reduce ? 1 : 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: reduce ? 0 : SLIDE_SECONDS, ease: "linear" }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search bar docked to the bottom edge of the stage */}
      <motion.form
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
        className="relative z-10 mx-3 -mt-12 grid gap-3 rounded-3xl border border-line bg-panel p-3 shadow-lift sm:mx-8 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end lg:mx-14 lg:p-4"
      >
        <div className="flex flex-col gap-1.5 px-1">
          <span id="hero-location" className="text-sm font-medium text-ink">Location</span>
          <Select
            aria-labelledby="hero-location"
            value={location}
            onChange={setLocation}
            options={[{ value: "", label: "Anywhere in Nigeria" }, ...states]}
          />
        </div>
        <div className="flex flex-col gap-1.5 px-1">
          <span id="hero-type" className="text-sm font-medium text-ink">Type</span>
          <Select
            aria-labelledby="hero-type"
            value={type}
            onChange={setType}
            options={[{ value: "", label: "Any type" }, ...PROPERTY_TYPES]}
          />
        </div>
        <div className="flex flex-col gap-1.5 px-1">
          <span id="hero-budget" className="text-sm font-medium text-ink">Budget</span>
          <Select
            aria-labelledby="hero-budget"
            value={price}
            onChange={setPrice}
            options={[
              { value: "", label: "Any budget" },
              { value: "below", label: "Below ₦1 million" },
              { value: "above", label: "₦1 million and above" },
            ]}
          />
        </div>
        <Button type="submit" size="lg" className="sm:mb-px">
          <Search className="size-4" strokeWidth={2} aria-hidden="true" />
          Search
        </Button>
      </motion.form>
    </section>
  );
};

export default Hero;
