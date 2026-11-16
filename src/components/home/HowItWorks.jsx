import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BadgeCheck, FileSearch, Mail, MessageCircle, Phone, PhoneCall, SlidersHorizontal } from "lucide-react";
import Button from "../button";
import { PartnerLogo } from "../PartnerBadge";
import PropertyCard, { PropertyCardSkeleton } from "../PropertyCard";
import Reveal from "../Reveal";
import { PROPERTY_TYPES, stateSlug } from "../../lib/constants";
import { getListingStates } from "../../lib/useProperties";

const EASE = [0.16, 1, 0.3, 1];
const STEP_SECONDS = 6;

const STEPS = [
  {
    icon: SlidersHorizontal,
    title: "Search by location, type and budget",
    text: "Filter every listing down to the state, property type and price range that suit you.",
  },
  {
    icon: FileSearch,
    title: "Open a listing for the full picture",
    text: "See the photos, price, size, title document and amenities before you make a single call.",
  },
  {
    icon: PhoneCall,
    title: "Reach the partner directly",
    text: "Send an inquiry, call, or start a WhatsApp chat with the verified partner behind the property.",
  },
];

const chipClass =
  "rounded-full border border-line bg-panel px-4 py-2 text-[15px] text-ink transition duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-ink";

/** Step one, shown with working shortcuts into the catalog. */
const SearchPreview = ({ properties }) => {
  const states = getListingStates(properties);

  return (
    <div className="w-full max-w-md rounded-3xl border border-line bg-panel p-6 shadow-card sm:p-8">
      <p className="text-sm text-muted">Start with a state</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {states.map((state) => (
          <Link key={state} to={`/property/in/${stateSlug(state)}`} className={chipClass}>
            {state}
          </Link>
        ))}
        <Link to="/property" className={`${chipClass} !border-ink !bg-ink !text-white`}>All of Nigeria</Link>
      </div>

      <p className="mt-6 text-sm text-muted">Or by what you want to buy</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {PROPERTY_TYPES.map((type) => (
          <Link key={type} to={`/property?type=${encodeURIComponent(type)}`} className={chipClass}>
            {type === "Land" ? "Land" : "Houses"}
          </Link>
        ))}
        <Link to="/property?price=below" className={chipClass}>Below ₦1 million</Link>
        <Link to="/property?sort=price-asc" className={chipClass}>Lowest price first</Link>
      </div>
    </div>
  );
};

/** Step three, shown with the partner of a real listing. */
const PartnerPreview = ({ listing }) => {
  const partner = listing.partner ?? { name: listing.realtorName || "Propulse partner" };

  return (
    <div className="w-full max-w-md rounded-3xl border border-line bg-panel p-6 shadow-card sm:p-8">
      <div className="flex items-center gap-4">
        <PartnerLogo partner={partner} className="size-16 !rounded-2xl" />
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold tracking-tight text-ink">{partner.name}</p>
          <p className="flex items-center gap-1.5 text-sm font-medium text-accent-deep">
            <BadgeCheck className="size-4" strokeWidth={2} aria-hidden="true" />
            Verified partner
          </p>
        </div>
      </div>

      <ul className="mt-6 flex flex-col">
        {[
          { icon: Mail, label: "Send an inquiry from the listing" },
          { icon: Phone, label: "Call the partner's contact person" },
          { icon: MessageCircle, label: "Start a WhatsApp chat" },
        ].map((way) => (
          <li key={way.label} className="flex items-center gap-3 border-t border-line py-3.5 text-ink first:border-t-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
              <way.icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            {way.label}
          </li>
        ))}
      </ul>

      <Button to={`/property/${listing.id}`} className="mt-4 w-full">
        Contact about {listing.propertyName}
      </Button>
    </div>
  );
};

/**
 * "How it works" as something to use rather than read: choosing a step swaps the panel
 * beside it for a live piece of the product (catalog shortcuts, a real listing, its partner).
 * The steps also advance on their own until the visitor picks one.
 */
const HowItWorks = ({ properties = [], loading = false }) => {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  const listing = properties.find((property) => property.status !== "sold") ?? properties[0];

  useEffect(() => {
    if (!auto || reduce) return;
    const timer = setTimeout(() => setActive((value) => (value + 1) % STEPS.length), STEP_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [active, auto, reduce]);

  const choose = (index) => {
    setActive(index);
    setAuto(false);
  };

  const renderPreview = () => {
    if (loading || !listing) {
      return <div className="w-full max-w-sm"><PropertyCardSkeleton /></div>;
    }
    if (active === 0) return <SearchPreview properties={properties} />;
    if (active === 1) return <div className="w-full max-w-sm"><PropertyCard property={listing} /></div>;
    return <PartnerPreview listing={listing} />;
  };

  return (
    <section id="how-it-works" className="bg-tint">
      <div className="shell py-24 lg:py-28">
        <Reveal className="max-w-3xl">
          <h2 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">
            From first search to first conversation
          </h2>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">
            Three steps take you from browsing to speaking with a verified partner. Pick a step to
            try it.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <ol className="flex flex-col gap-3">
            {STEPS.map((step, index) => {
              const isActive = index === active;
              return (
                <Reveal as="li" key={step.title} delay={index * 0.08}>
                  <button
                    type="button"
                    onClick={() => choose(index)}
                    aria-pressed={isActive}
                    className={`relative flex w-full gap-5 overflow-hidden rounded-3xl border p-5 text-left transition-colors duration-500 sm:p-6 ${
                      isActive ? "border-transparent bg-panel shadow-card" : "border-line hover:border-ink"
                    }`}
                  >
                    <span
                      className={`flex size-12 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ${
                        isActive ? "bg-ink text-accent" : "bg-panel text-muted"
                      }`}
                    >
                      <step.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-xl font-semibold tracking-tight transition-colors duration-500 ${isActive ? "text-ink" : "text-muted"}`}>
                        {step.title}
                      </span>
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.span
                            className="block overflow-hidden leading-relaxed text-muted"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.45, ease: EASE }}
                          >
                            <span className="block pt-2">{step.text}</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>

                    {/* Time left before the next step takes over */}
                    {isActive && auto && !reduce && (
                      <motion.span
                        key={`timer-${index}`}
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-accent"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: STEP_SECONDS, ease: "linear" }}
                      />
                    )}
                  </button>
                </Reveal>
              );
            })}
          </ol>

          <Reveal delay={0.15} className="relative flex min-h-[30rem] items-center justify-center overflow-hidden rounded-3xl bg-accent-soft p-5 sm:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full border border-accent/30" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-16 size-96 rounded-full border border-accent/30" />

            <AnimatePresence mode="wait">
              <motion.div
                key={loading || !listing ? "loading" : active}
                className="relative flex w-full justify-center"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {renderPreview()}
              </motion.div>
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
