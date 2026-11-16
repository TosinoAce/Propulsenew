import { useRef } from "react";
import {
  motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform,
} from "motion/react";
import { BadgeCheck, ClipboardCheck, Eye, Handshake, MessagesSquare, Target, UserCheck } from "lucide-react";
import MainLayout from "../layout/MainLayout";
import Seo, { breadcrumbs } from "../components/Seo";
import CtaBand from "../components/CtaBand";
import PartnerCarousel from "../components/PartnerCarousel";
import Reveal from "../components/Reveal";
import CountUp from "../components/motion/CountUp";
import ParallaxImage from "../components/motion/ParallaxImage";
import Spotlight from "../components/motion/Spotlight";
import Tilt from "../components/motion/Tilt";
import { usePartners } from "../lib/usePartners";
import { SIZES, responsiveImage } from "../lib/images";
import { getListingStates, useProperties } from "../lib/useProperties";

const EASE = [0.16, 1, 0.3, 1];
const SPRING = { stiffness: 90, damping: 20, mass: 0.6 };

// STAND-IN PORTRAITS: stock photos, not the people named. Replace the files in
// public/team/ (or change `portrait`) with real photos before launch.
const TEAM = [
  { name: "Abdullahi Ashiru", role: "Co-CEO", portrait: "/team/portrait-01.jpg" },
  { name: "Oluwatosin Joseph", role: "Co-CEO", portrait: "/team/portrait-02.jpg" },
];

const JOURNEY = [
  {
    icon: Handshake,
    title: "We choose who we work with",
    text: "Firms cannot sign up and post on Propulse. Each partner is brought on by our team.",
  },
  {
    icon: UserCheck,
    title: "We verify the partner",
    text: "A partner carries the verified mark only after our team has checked them.",
  },
  {
    icon: ClipboardCheck,
    title: "Our team lists the property",
    text: "We add each property ourselves, with its price, size, photos and title document.",
  },
  {
    icon: MessagesSquare,
    title: "You speak to the partner",
    text: "Sign in, then send an inquiry, call or start a WhatsApp chat with the partner directly.",
  },
];

/**
 * Opening stage. The photo and the three figure cards sit at different depths and shift
 * with the cursor, so moving the mouse feels like looking around the scene.
 */
const Stage = ({ stats }) => {
  const reduce = useReducedMotion();
  const px = useSpring(useMotionValue(0), SPRING);
  const py = useSpring(useMotionValue(0), SPRING);

  // Deeper layers move less, nearer ones more
  const photoX = useTransform(px, (value) => value * -18);
  const photoY = useTransform(py, (value) => value * -18);
  const nearX = useTransform(px, (value) => value * 26);
  const nearY = useTransform(py, (value) => value * 26);
  const midX = useTransform(px, (value) => value * 14);
  const midY = useTransform(py, (value) => value * 14);
  const layers = [
    { x: nearX, y: nearY },
    { x: midX, y: midY },
    { x: nearX, y: midY },
  ];

  const handleMove = (event) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    py.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const handleLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <section className="shell pt-[84px]">
      <div
        className="relative flex min-h-[min(80dvh,48rem)] flex-col justify-end overflow-hidden rounded-3xl bg-ink"
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        <motion.img
          {...responsiveImage("/photos/lagos-lekki-aerial.jpg", SIZES.full)}
          alt="Aerial view of Lagos with the Civic Centre tower beside the lagoon"
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover"
          style={{ x: photoX, y: photoY, scale: 1.08 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/55 to-transparent" aria-hidden="true" />

        <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:p-14">
          <motion.div
            initial={{ y: 28 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">About Us</p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tighter text-white sm:text-6xl lg:text-7xl">
              Property in Nigeria, made clear.
            </h1>
            <p className="mt-6 max-w-[50ch] text-lg leading-relaxed text-white/85">
              Propulse lists land and houses from a closed group of verified partners, and connects
              you directly with the partner behind every listing.
            </p>
          </motion.div>

          {(
            <dl className="grid min-h-[6.5rem] grid-cols-3 gap-3 lg:min-h-[22rem] lg:grid-cols-1 lg:justify-items-end">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  style={layers[index % layers.length]}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.12, ease: EASE }}
                  className="rounded-2xl border border-white/15 bg-ink/55 px-4 py-4 text-white backdrop-blur-md sm:px-6 lg:w-64"
                >
                  <dd className="text-4xl font-semibold tracking-tighter text-accent sm:text-5xl">
                    <CountUp value={stat.value} />
                  </dd>
                  <dt className="mt-1 text-sm text-white/80 sm:text-base">{stat.label}</dt>
                </motion.div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
};

/** One stop on the journey. Its marker lights up as the scroll line reaches it. */
const Milestone = ({ step, progress, range }) => {
  const lit = useTransform(progress, range, [0, 1]);
  const dim = useTransform(lit, (value) => 0.35 + value * 0.65);

  return (
    <motion.li className="relative grid grid-cols-[3.5rem_1fr] gap-5 pb-14 last:pb-0" style={{ opacity: dim }}>
      <div className="relative z-10 flex size-14 items-center justify-center rounded-full border border-line bg-panel text-muted">
        <motion.span className="absolute inset-0 rounded-full bg-ink" style={{ opacity: lit }} aria-hidden="true" />
        <step.icon className="relative size-6 text-accent" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="pt-2">
        <h3 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{step.title}</h3>
        <p className="mt-2 max-w-[46ch] text-lg leading-relaxed text-muted">{step.text}</p>
      </div>
    </motion.li>
  );
};

/** How a property reaches the site, told as a line that draws itself down the page on scroll. */
const Journey = () => {
  const track = useRef(null);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start 0.75", "end 0.55"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <section className="bg-tint">
      <div className="shell grid gap-12 py-24 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:py-28">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <h2 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">
              How a property reaches Propulse
            </h2>
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-muted">
              Nothing is posted by strangers. Every listing travels the same four steps before you
              see it.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-8 hidden lg:block">
            <ParallaxImage
              src="/photos/house-keys.jpg"
              alt="A hand holding house keys with a small house-shaped key ring"
              className="aspect-[4/3]"
              loading="lazy"
            />
          </Reveal>
        </div>

        <ol ref={track} className="relative">
          {/* The rail, and the amber line that fills it as the reader scrolls */}
          <span aria-hidden="true" className="absolute bottom-0 left-7 top-0 w-px -translate-x-1/2 bg-line" />
          <motion.span
            aria-hidden="true"
            className="absolute bottom-0 left-7 top-0 w-[3px] origin-top -translate-x-1/2 rounded-full bg-accent"
            style={{ scaleY: progress }}
          />
          {JOURNEY.map((step, index) => (
            <Milestone
              key={step.title}
              step={step}
              progress={progress}
              range={[index / JOURNEY.length, index / JOURNEY.length + 0.12]}
            />
          ))}
        </ol>
      </div>
    </section>
  );
};

const About = () => {
  const { properties } = useProperties();
  const { partners } = usePartners();
  const stateCount = getListingStates(properties).length;

  // How many listings each partner has, for the partner cards
  const listingCounts = {};
  for (const property of properties) {
    const partnerId = property.partner?.id;
    if (partnerId) listingCounts[partnerId] = (listingCounts[partnerId] ?? 0) + 1;
  }

  // Every number here is counted from the live catalog
  const stats = [
    properties.length > 0 && { value: properties.length, label: "Listings" },
    partners.length > 0 && { value: partners.length, label: "Verified partners" },
    stateCount > 0 && { value: stateCount, label: "States" },
  ].filter(Boolean);

  return (
    <MainLayout>
      <Seo
        title="About Propulse"
        description="Propulse is a Nigerian real estate platform that lists land and houses only from verified partners, and connects buyers directly with the partner behind every listing."
        image="/photos/lagos-lekki-aerial-1280.webp"
        jsonLd={breadcrumbs([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])}
      />
      <Stage stats={stats} />

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
              Finding property in Nigeria often means scattered listings, unclear prices and no way
              to tell who is genuine before you have already paid for an inspection.
            </p>
            <p>
              Propulse is not an open marketplace. We work with a small group of partners, check
              each one, and list only their properties. Every listing shows its price, size, title
              document and the partner behind it, so you can speak to them directly.
            </p>
          </div>
        </Reveal>
      </section>

      <Journey />

      {/* Vision and mission */}
      <section className="shell grid gap-5 pt-24 md:grid-cols-2 lg:pt-28">
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
                To connect property seekers with verified partners through clear listings, honest
                pricing and a simple, stress-free experience.
              </p>
            </div>
          </Spotlight>
        </Reveal>
      </section>

      {/* Team, centred on the page */}
      <section className="shell py-24 text-center lg:py-28">
        <Reveal>
          <h2 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">Our dedicated team</h2>
          <p className="mt-4 text-lg text-muted">Passionate individuals working together.</p>
        </Reveal>

        <ul className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
          {TEAM.map((member, index) => (
            <Reveal as="li" key={member.name} delay={index * 0.1}>
              <Tilt max={6} className="aspect-[4/5]">
                <div className="group relative size-full overflow-hidden rounded-3xl bg-ink shadow-card">
                  <img
                    {...responsiveImage(member.portrait, "(min-width: 640px) 384px, 100vw")}
                    alt={`Portrait of ${member.name}`}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover object-top transition-transform duration-[1200ms] ease-out-expo group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" aria-hidden="true" />
                  <div className="absolute inset-x-6 bottom-6 text-center text-white">
                    <h3 className="text-3xl font-semibold tracking-tight">{member.name}</h3>
                    <p className="mt-1 text-lg text-accent">{member.role}</p>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Partners: the live partner list as a gliding row of cards */}
      {partners.length > 0 && (
        <section className="overflow-hidden bg-tint py-24 lg:py-28">
          <Reveal className="shell flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">Our partners</h2>
              <p className="mt-4 flex max-w-[56ch] items-start gap-2 text-lg text-muted">
                <BadgeCheck className="mt-1 size-5 shrink-0 text-accent-deep" strokeWidth={2} aria-hidden="true" />
                Every partner is checked by our team before a single property of theirs is listed.
              </p>
            </div>
            <p className="text-lg text-muted">
              <span className="text-5xl font-semibold tracking-tighter text-ink">{partners.length}</span>{" "}
              verified {partners.length === 1 ? "partner" : "partners"}
            </p>
          </Reveal>

          <Reveal className="mt-10" delay={0.1}>
            <PartnerCarousel partners={partners} listingCounts={listingCounts} />
          </Reveal>
        </section>
      )}

      <CtaBand />
    </MainLayout>
  );
};

export default About;
