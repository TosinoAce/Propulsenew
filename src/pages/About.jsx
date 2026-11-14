import { motion } from "motion/react";
import { Eye, Target } from "lucide-react";
import MainLayout from "../layout/MainLayout";
import CtaBand from "../components/CtaBand";
import Reveal from "../components/Reveal";
import CountUp from "../components/motion/CountUp";
import ParallaxImage from "../components/motion/ParallaxImage";
import Spotlight from "../components/motion/Spotlight";
import Tilt from "../components/motion/Tilt";
import { useProperties } from "../lib/useProperties";

const EASE = [0.16, 1, 0.3, 1];

// To show a portrait, add `portrait: "/team/<file>.jpg"` to a member. Until then the
// card uses a location photo with the member's initials.
const TEAM = [
  {
    name: "Abdullahi Ashiru",
    role: "Co-CEO",
    initials: "AA",
    backdrop: "/photos/lagos-bridge.jpg",
    backdropAlt: "The Lekki-Ikoyi Link Bridge in Lagos under a pale evening sky",
  },
  {
    name: "Oluwatosin Joseph",
    role: "Co-CEO",
    initials: "OJ",
    backdrop: "/photos/house-white.jpg",
    backdropAlt: "The entrance of a modern white house with a timber front door",
  },
];

// SAMPLE DATA: these firm names are invented for the layout. Replace them with your real partners.
const PARTNERS = [
  { name: "Harbourline Estates", mark: "H" },
  { name: "Oakfield Realty", mark: "O" },
  { name: "Crestpoint Homes", mark: "C" },
  { name: "Meridian Surveyors", mark: "M" },
  { name: "Lagoon & Stone", mark: "L" },
  { name: "Savannah Title", mark: "S" },
  { name: "Northgate Properties", mark: "N" },
];

const PartnerMark = ({ partner, hidden = false }) => (
  <li
    aria-hidden={hidden || undefined}
    className="flex shrink-0 items-center gap-3 rounded-full border border-line bg-panel py-3 pl-3 pr-6"
  >
    <span className="flex size-10 items-center justify-center rounded-full bg-ink text-lg font-semibold text-accent">
      {partner.mark}
    </span>
    <span className="whitespace-nowrap text-lg font-medium tracking-tight text-ink">{partner.name}</span>
  </li>
);

const About = () => {
  const { properties } = useProperties();

  const stats = [
    properties.length > 0 && { value: properties.length, label: "Listings live right now" },
    { value: 2, label: "States covered: Kwara and Lagos" },
    { value: 3, label: "Ways to reach a realtor from any listing" },
  ].filter(Boolean);

  return (
    <MainLayout>
      {/* Opening: statement on the left, a three-photo collage on the right */}
      <section className="shell grid gap-12 pt-32 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 lg:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent-deep">About Us</p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-tighter text-ink sm:text-6xl">
            Property in Nigeria, made clear.
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
            Propulse is a real estate platform that helps you discover land and houses across Kwara
            and Lagos State, and connects you directly with the realtor behind every listing.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-5 grid-rows-2 gap-4 sm:gap-5"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: EASE }}
        >
          <ParallaxImage
            src="/photos/lagos-lekki-aerial.jpg"
            alt="Aerial view of Lagos with the Civic Centre tower beside the lagoon"
            className="col-span-3 row-span-2 aspect-[3/4]"
            shift={6}
            fetchPriority="high"
          />
          <ParallaxImage
            src="/photos/house-keys.jpg"
            alt="A hand holding house keys with a small house-shaped key ring"
            className="col-span-2"
            shift={10}
          />
          <ParallaxImage
            src="/photos/land-plots.jpg"
            alt="Serviced plots of green land divided by new roads"
            className="col-span-2"
            shift={10}
          />
        </motion.div>
      </section>

      {/* Numbers taken from the live catalog */}
      <section className="shell pt-20">
        <dl className={`grid gap-8 border-y border-line py-10 ${stats.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <dd className="text-6xl font-semibold tracking-tighter text-ink">
                <CountUp value={stat.value} />
              </dd>
              <dt className="mt-2 max-w-[24ch] text-muted">{stat.label}</dt>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Story */}
      <section className="shell grid gap-12 py-24 lg:grid-cols-2 lg:items-center lg:gap-20 lg:py-28">
        <Reveal>
          <ParallaxImage
            src="/photos/lagos-neighbourhood.jpg"
            alt="Sunset over the rooftops of a Lagos neighbourhood"
            className="aspect-[4/3]"
            loading="lazy"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">Why we started</h2>
          <div className="mt-6 flex max-w-[58ch] flex-col gap-5 text-lg leading-relaxed text-muted">
            <p>
              Finding property in Nigeria often means scattered listings, unclear prices and too
              many people between you and the person who can answer your questions.
            </p>
            <p>
              Propulse brings land and houses together in one place. Every listing shows its price,
              size, location and amenities, and names the realtor handling it so you can speak to
              them directly.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Vision and mission */}
      <section className="shell grid gap-5 md:grid-cols-2">
        <Reveal>
          <Spotlight tone="dark" className="flex h-full min-h-[22rem] flex-col justify-between rounded-3xl bg-ink p-8 text-white sm:p-10">
            <Eye className="relative size-10 text-accent" strokeWidth={1.5} aria-hidden="true" />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight">Vision</h2>
              <p className="mt-3 max-w-[44ch] text-lg leading-relaxed text-white/75">
                To be the most trusted place to find property in Nigeria, where anyone can discover
                land and homes with confidence and clarity.
              </p>
            </div>
          </Spotlight>
        </Reveal>
        <Reveal delay={0.08}>
          <Spotlight className="flex h-full min-h-[22rem] flex-col justify-between rounded-3xl bg-accent-soft p-8 sm:p-10">
            <Target className="relative size-10 text-accent-deep" strokeWidth={1.5} aria-hidden="true" />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight text-ink">Mission</h2>
              <p className="mt-3 max-w-[44ch] text-lg leading-relaxed text-ink-soft">
                To connect property seekers with reliable realtors through clear listings, honest
                pricing and a simple, stress-free experience.
              </p>
            </div>
          </Spotlight>
        </Reveal>
      </section>

      {/* Team */}
      <section className="shell py-24 lg:py-28">
        <Reveal>
          <h2 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">Our dedicated team</h2>
          <p className="mt-4 text-lg text-muted">Passionate individuals working together.</p>
        </Reveal>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:max-w-4xl">
          {TEAM.map((member, index) => (
            <Reveal as="li" key={member.name} delay={index * 0.1}>
              <Tilt max={6} className="aspect-[4/5]">
                <div className="group relative size-full overflow-hidden rounded-3xl bg-ink shadow-card">
                  <img
                    src={member.portrait ?? member.backdrop}
                    alt={member.portrait ? `Portrait of ${member.name}` : member.backdropAlt}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" aria-hidden="true" />

                  {!member.portrait && (
                    <span className="absolute left-6 top-6 flex size-16 items-center justify-center rounded-full border border-white/30 bg-white/15 text-xl font-semibold text-white backdrop-blur-md">
                      {member.initials}
                    </span>
                  )}

                  <div className="absolute inset-x-6 bottom-6 text-white">
                    <h3 className="text-3xl font-semibold tracking-tight">{member.name}</h3>
                    <p className="mt-1 text-lg text-accent">{member.role}</p>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Partners: a continuous strip that pauses under the cursor */}
      <section className="overflow-hidden bg-tint py-20">
        <Reveal className="shell">
          <h2 className="text-3xl font-semibold tracking-tighter text-ink sm:text-4xl">Our partners</h2>
          <p className="mt-3 max-w-[52ch] text-lg text-muted">
            The realtors, surveyors and title firms we work with.
          </p>
        </Reveal>

        <div className="mt-10 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <ul className="flex w-max animate-marquee gap-4 pr-4 hover:[animation-play-state:paused]">
            {PARTNERS.map((partner) => <PartnerMark key={partner.name} partner={partner} />)}
            {PARTNERS.map((partner) => <PartnerMark key={`${partner.name}-copy`} partner={partner} hidden />)}
          </ul>
        </div>
      </section>

      <CtaBand />
    </MainLayout>
  );
};

export default About;
