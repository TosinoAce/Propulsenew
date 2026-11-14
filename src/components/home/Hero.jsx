import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, MapPin, Search } from "lucide-react";
import Button from "../button";
import Magnetic from "../motion/Magnetic";
import ParallaxImage from "../motion/ParallaxImage";
import { LOCATIONS, PROPERTY_TYPES } from "../../lib/useProperties";

const EASE = [0.16, 1, 0.3, 1];

// The headline, text and actions arrive one after another so the eye lands on them in order
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

const Hero = ({ preview }) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (type) params.set("type", type);
    if (price) params.set("price", price);
    const query = params.toString();
    navigate(query ? `/property?${query}` : "/property");
  };

  return (
    <section className="bg-tint">
      <div className="shell grid min-h-[min(100dvh,58rem)] items-center gap-10 pb-16 pt-24 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <motion.div className="min-w-0" variants={container} initial="hidden" animate="show">
          <motion.h1
            variants={item}
            className="text-5xl font-semibold leading-[1.04] tracking-tighter text-ink lg:text-6xl"
          >
            Find land and homes <span className="text-accent-deep">worth owning.</span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted">
            Browse curated listings across Kwara and Lagos State, then talk directly to the realtor
            behind each one.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <Button to="/property" size="lg">
                Browse properties
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </Button>
            </Magnetic>
            <Button href="#how-it-works" variant="secondary" size="lg">How it works</Button>
          </motion.div>

          <motion.form
            variants={item}
            onSubmit={handleSearch}
            className="mt-10 grid gap-3 rounded-3xl border border-line bg-panel p-3 shadow-card sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
          >
            <label className="flex flex-col gap-1.5 px-1 text-sm font-medium text-ink">
              Location
              <select className="field-input" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Anywhere</option>
                {LOCATIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 px-1 text-sm font-medium text-ink">
              Type
              <select className="field-input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Any type</option>
                {PROPERTY_TYPES.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 px-1 text-sm font-medium text-ink">
              Budget
              <select className="field-input" value={price} onChange={(e) => setPrice(e.target.value)}>
                <option value="">Any budget</option>
                <option value="below">Below ₦1 million</option>
                <option value="above">₦1 million and above</option>
              </select>
            </label>
            <Button type="submit" variant="accent" className="sm:mb-px">
              <Search className="size-4" strokeWidth={2} aria-hidden="true" />
              Search
            </Button>
          </motion.form>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full min-w-0 max-w-xl lg:max-w-none"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
        >
          <ParallaxImage
            src="/Vector-1.png"
            alt="A smiling man on a sofa holding up a paper house while using a laptop"
            shift={4}
            className="aspect-[4/5] !bg-[#c9cfd1] sm:aspect-[5/4] lg:aspect-[4/5] lg:max-h-[calc(100dvh-9rem)] lg:w-full"
            imgClassName="object-top"
            fetchPriority="high"
          />

          {/* A real listing from the catalog, so the hero shows the product itself */}
          {preview && (
            <motion.div
              className="absolute -bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 lg:-left-10 lg:right-auto"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
            >
              <Link
                to={`/property/${preview.id}`}
                className="group flex items-center gap-4 rounded-3xl border border-line bg-panel p-3 shadow-lift transition-transform duration-500 ease-out-expo hover:-translate-y-1"
              >
                <img
                  src={preview.propertyImage}
                  alt=""
                  className="size-16 shrink-0 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{preview.propertyName}</p>
                  <p className="flex items-center gap-1 truncate text-sm text-muted">
                    <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    {preview.propertyLocation}
                  </p>
                  <p className="text-sm font-semibold text-accent-deep">₦{preview.propertyPrice}</p>
                </div>
                <ArrowRight
                  className="mr-1 size-5 shrink-0 text-muted transition-transform duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-ink"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
