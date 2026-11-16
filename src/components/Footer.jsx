import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUp, ArrowUpRight, BadgeCheck } from "lucide-react";
import BrandMark from "./BrandMark";
import Button from "./button";
import Reveal from "./Reveal";
import Magnetic from "./motion/Magnetic";
import Spotlight from "./motion/Spotlight";
import { PROPERTY_TYPES, stateSlug } from "../lib/constants";
import { getListingStates, useProperties } from "../lib/useProperties";

const EASE = [0.16, 1, 0.3, 1];

const buildColumns = (states) => [
  {
    title: "Explore",
    links: [
      { to: "/property", label: "All properties" },
      { to: "/landbanking", label: "Land Banking" },
      { to: "/savedproperties", label: "Saved Properties" },
    ],
  },
  {
    title: "Browse by state",
    links: states.map((state) => ({
      to: `/property/in/${stateSlug(state)}`,
      label: state,
    })),
  },
  {
    title: "Browse by type",
    links: PROPERTY_TYPES.map((type) => ({
      to: `/property?type=${encodeURIComponent(type)}`,
      label: type === "Land" ? "Land for sale" : "Houses for sale",
    })),
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/blog", label: "Blog" },
      { to: "/careers", label: "Careers" },
      { to: "/contact", label: "Contact" },
    ],
  },
];

/**
 * Site footer: a dark rounded panel that closes every page. It carries the brand mark,
 * live catalog figures, the link columns and an oversized brand name along its bottom edge.
 */
const Footer = () => {
  const { properties } = useProperties();
  const states = getListingStates(properties);
  // Up to five states with the most listings
  const columns = buildColumns(states.slice(0, 5)).filter((column) => column.links.length > 0);
  const partnerCount = new Set(properties.map((property) => property.partner?.id).filter(Boolean)).size;

  const figures = [
    { value: properties.length, label: properties.length === 1 ? "listing" : "listings" },
    { value: partnerCount, label: partnerCount === 1 ? "verified partner" : "verified partners" },
    { value: states.length, label: states.length === 1 ? "state" : "states" },
  ].filter((figure) => figure.value > 0);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="mt-24 px-3 pb-3 sm:px-4 sm:pb-4">
      <Spotlight tone="dark" className="rounded-3xl bg-ink text-white">
        {/* The brand's heartbeat draws itself across the top edge as the footer comes into view */}
        <svg
          viewBox="0 0 1200 48"
          preserveAspectRatio="none"
          className="relative block h-12 w-full"
          fill="none"
          aria-hidden="true"
        >
          <motion.path
            d="M0 24 H500 L528 6 L562 44 L596 10 L618 24 H1200"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />
        </svg>

        <div className="shell relative pb-10 pt-10">
          {/* Brand, statement and the way to reach the team */}
          <Reveal className="grid gap-10 border-b border-white/15 pb-12 lg:grid-cols-[1.5fr_1fr] lg:items-end">
            <div>
              <Link to="/" aria-label="Propulse home" className="inline-flex items-center gap-3">
                <BrandMark roof="#fdfefd" className="w-14" />
                <span className="text-2xl font-semibold tracking-tight">Propulse</span>
              </Link>
              <p className="mt-6 max-w-xl text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
                Land and houses from verified partners across Nigeria, one message away.
              </p>
            </div>

            <div className="flex flex-col gap-6 lg:items-end">
              {figures.length > 0 && (
                <dl className="flex flex-wrap gap-x-8 gap-y-3 lg:justify-end">
                  {figures.map((figure) => (
                    <div key={figure.label}>
                      <dd className="text-4xl font-semibold tracking-tighter text-accent">{figure.value}</dd>
                      <dt className="text-sm text-white/65">{figure.label}</dt>
                    </div>
                  ))}
                </dl>
              )}
              <Magnetic>
                <Button to="/contact" variant="accent" size="lg">
                  Get in touch
                  <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden="true" />
                </Button>
              </Magnetic>
            </div>
          </Reveal>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-4">
            {columns.map((column, index) => (
              <Reveal as="nav" key={column.title} aria-label={column.title} delay={index * 0.06}>
                <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-white/50">{column.title}</h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="group inline-flex items-center text-lg text-white/80 transition-colors duration-300 hover:text-white"
                      >
                        <span className="h-px w-0 bg-accent transition-all duration-300 ease-out-expo group-hover:mr-2 group-hover:w-4" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          {/* Legal line and back to top */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-sm text-white/60">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>© {new Date().getFullYear()} Propulse, Inc.</span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="size-4 text-accent" strokeWidth={2} aria-hidden="true" />
                Get comfort with reliability.
              </span>
            </p>
            <button
              type="button"
              onClick={scrollToTop}
              className="group inline-flex items-center gap-2 rounded-full border border-white/25 py-2 pl-4 pr-2 text-white transition-colors duration-300 hover:border-white"
            >
              Back to top
              <span className="flex size-7 items-center justify-center rounded-full bg-accent text-ink transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5">
                <ArrowUp className="size-4" strokeWidth={2} aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>

        {/* Oversized brand name that rises into place and is cut off by the panel's bottom edge */}
        <motion.p
          aria-hidden="true"
          className="relative -mb-[0.2em] select-none text-center text-[18.5vw] font-semibold leading-none tracking-tighter text-white/[0.06]"
          initial={{ y: "35%", opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          PROPULSE
        </motion.p>
      </Spotlight>
    </footer>
  );
};

export default Footer;
