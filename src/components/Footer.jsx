import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import Button from "./button";
import Reveal from "./Reveal";
import Magnetic from "./motion/Magnetic";
import { LOCATIONS, PROPERTY_TYPES } from "../lib/useProperties";

const EASE = [0.16, 1, 0.3, 1];

const COLUMNS = [
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
    links: LOCATIONS.map((state) => ({
      to: `/property?location=${encodeURIComponent(state)}`,
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
      { to: "/contact", label: "Get in Touch" },
    ],
  },
];

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="mt-24 overflow-hidden bg-tint">
      {/* The brand's heartbeat draws itself across the top edge as the footer comes into view */}
      <svg
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        className="block h-12 w-full"
        fill="none"
        aria-hidden="true"
      >
        <motion.path
          d="M0 24 H500 L528 6 L562 44 L596 10 L618 24 H1200"
          stroke="var(--color-accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
      </svg>

      <div className="shell pb-10 pt-12">
        {/* Opening line and the way to reach the team */}
        <Reveal className="flex flex-col gap-8 border-b border-line pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link to="/" aria-label="Propulse home" className="inline-block">
              <img src="/propulseLogo.png" alt="Propulse" className="h-14 w-auto" />
            </Link>
            <p className="mt-5 max-w-xl text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
              Land and houses across Kwara and Lagos State, with the realtor one message away.
            </p>
          </div>
          <Magnetic className="self-start lg:self-auto">
            <Button to="/contact" size="lg">
              Get in touch
              <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </Button>
          </Magnetic>
        </Reveal>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-4">
          {COLUMNS.map((column, index) => (
            <Reveal as="nav" key={column.title} aria-label={column.title} delay={index * 0.06}>
              <h2 className="text-sm font-semibold text-ink">{column.title}</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center text-muted transition-colors duration-300 hover:text-ink"
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
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm text-muted">
          <p>© {new Date().getFullYear()} Propulse, Inc. Get comfort with reliability.</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-2 rounded-full border border-line bg-panel py-2 pl-4 pr-2 text-ink transition-colors duration-300 hover:border-ink"
          >
            Back to top
            <span className="flex size-7 items-center justify-center rounded-full bg-ink text-white transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5">
              <ArrowUp className="size-4" strokeWidth={2} aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>

      {/* Oversized brand name that rises into place and is cut off by the bottom edge */}
      <motion.p
        aria-hidden="true"
        className="-mb-[0.22em] select-none text-center text-[19vw] font-semibold leading-none tracking-tighter text-ink/[0.06]"
        initial={{ y: "35%", opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        PROPULSE
      </motion.p>
    </footer>
  );
};

export default Footer;
