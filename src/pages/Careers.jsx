import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, Briefcase, Clock, Compass, HeartHandshake, MapPin, Sparkles } from "lucide-react";
import supabase from "../lib/supabase";
import MainLayout from "../layout/MainLayout";
import Seo, { breadcrumbs } from "../components/Seo";
import Button from "../components/button";
import EmptyState from "../components/EmptyState";
import Reveal from "../components/Reveal";
import ParallaxImage from "../components/motion/ParallaxImage";
import Spotlight from "../components/motion/Spotlight";

const EASE = [0.16, 1, 0.3, 1];

const VALUES = [
  {
    icon: HeartHandshake,
    title: "Trust is the product",
    text: "Buyers come to us because they can rely on what they see. Everything we do protects that.",
  },
  {
    icon: Compass,
    title: "Clear over clever",
    text: "Plain prices, plain language and plain answers, for buyers and for partners.",
  },
  {
    icon: Sparkles,
    title: "Small team, real ownership",
    text: "Each person owns a real part of the business and sees the difference their work makes.",
  },
];

/** Careers page: why join, what we value, and the open roles from the admin area. */
const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [team, setTeam] = useState("");

  useEffect(() => {
    let active = true;
    supabase
      .from("jobs")
      .select("id, title, slug, team, location, employment_type, summary")
      .eq("is_open", true)
      .order("created_at", { ascending: false })
      .then(({ data, error: loadError }) => {
        if (!active) return;
        if (loadError) {
          console.error("Failed to load jobs:", loadError);
          setError(true);
        } else {
          setJobs(data);
        }
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const teams = [...new Set(jobs.map((job) => job.team).filter(Boolean))];
  const visible = team ? jobs.filter((job) => job.team === team) : jobs;

  return (
    <MainLayout>
      <Seo
        title="Careers at Propulse"
        description="Join Propulse and help people across Nigeria buy property they can trust. See our open roles in Lagos, Ilorin and remote."
        jsonLd={breadcrumbs([{ name: "Home", path: "/" }, { name: "Careers", path: "/careers" }])}
      />
      {/* Opening */}
      <section className="shell grid gap-12 pt-32 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:pt-36">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent-deep">Careers</p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-tighter text-ink sm:text-6xl">
            Help people buy property they can trust.
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
            We are a small team making property in Nigeria clearer, one verified listing at a time.
            If that sounds like work you want to do, we would like to hear from you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#open-roles" size="lg">
              See open roles
              {!loading && jobs.length > 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-sm text-ink">{jobs.length}</span>
              )}
            </Button>
            <Button to="/about" variant="secondary" size="lg">About Propulse</Button>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-5 gap-4"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: EASE }}
        >
          <ParallaxImage
            src="/photos/lagos-neighbourhood.jpg"
            alt="Sunset over the rooftops of a Lagos neighbourhood"
            className="col-span-3 aspect-[3/4]"
            shift={6}
          />
          <div className="col-span-2 flex flex-col gap-4">
            <ParallaxImage src="/photos/lagos-bridge.jpg" alt="The Lekki-Ikoyi Link Bridge in Lagos" className="aspect-[3/4]" shift={9} />
            <ParallaxImage src="/photos/house-white.jpg" alt="The entrance of a modern white house" className="aspect-square" shift={9} />
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="shell pt-24">
        <Reveal>
          <h2 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">How we work</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {VALUES.map((value, index) => (
            <Reveal key={value.title} delay={index * 0.08}>
              <Spotlight
                tone={index === 1 ? "dark" : "light"}
                className={`flex h-full min-h-[16rem] flex-col justify-between rounded-3xl p-8 ${
                  index === 1 ? "bg-ink text-white" : index === 0 ? "bg-accent-soft" : "border border-line bg-panel"
                }`}
              >
                <value.icon className={`relative size-9 ${index === 1 ? "text-accent" : "text-accent-deep"}`} strokeWidth={1.5} aria-hidden="true" />
                <div className="relative">
                  <h3 className={`text-2xl font-semibold tracking-tight ${index === 1 ? "" : "text-ink"}`}>{value.title}</h3>
                  <p className={`mt-2 leading-relaxed ${index === 1 ? "text-white/75" : "text-muted"}`}>{value.text}</p>
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Open roles */}
      <section id="open-roles" className="shell scroll-mt-24 pt-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">Open roles</h2>
            <p className="mt-3 text-lg text-muted">
              {loading ? "Loading roles" : `${jobs.length} ${jobs.length === 1 ? "role" : "roles"} open right now`}
            </p>
          </div>
          {teams.length > 1 && (
            <div className="flex flex-wrap gap-1 rounded-full bg-tint p-1" role="group" aria-label="Filter by team">
              {["", ...teams].map((entry) => {
                const active = entry === team;
                return (
                  <button
                    key={entry || "all"}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTeam(entry)}
                    className={`relative rounded-full px-4 py-2 text-[15px] transition-colors duration-300 ${active ? "text-white" : "text-muted hover:text-ink"}`}
                  >
                    {active && (
                      <motion.span layoutId="job-team" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                    )}
                    <span className="relative">{entry || "All teams"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </Reveal>

        {loading ? (
          <div className="mt-8 flex flex-col gap-3" aria-hidden="true">
            {Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-28 !rounded-3xl" />)}
          </div>
        ) : error ? (
          <EmptyState icon={Briefcase} title="We could not load the roles" text="Please check your connection and refresh the page." />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No open roles right now"
            text="We are not hiring at the moment, but we are always glad to hear from good people."
          >
            <Button to="/contact" variant="secondary">Get in touch</Button>
          </EmptyState>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {visible.map((job, index) => (
              <Reveal as="li" key={job.id} delay={index * 0.06}>
                <Link
                  to={`/careers/${job.slug}`}
                  className="group flex flex-wrap items-center gap-6 rounded-3xl border border-line bg-panel p-6 transition duration-500 ease-out-expo hover:-translate-y-0.5 hover:border-ink hover:shadow-lift sm:p-8"
                >
                  <div className="min-w-0 flex-1">
                    {job.team && <p className="text-sm font-medium text-accent-deep">{job.team}</p>}
                    <h3 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{job.title}</h3>
                    {job.summary && <p className="mt-2 max-w-[62ch] leading-relaxed text-muted">{job.summary}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {job.location && (
                      <span className="flex items-center gap-1.5 rounded-full bg-tint px-3 py-1.5 text-ink">
                        <MapPin className="size-4" strokeWidth={1.75} aria-hidden="true" />
                        {job.location}
                      </span>
                    )}
                    {job.employment_type && (
                      <span className="flex items-center gap-1.5 rounded-full bg-tint px-3 py-1.5 text-ink">
                        <Clock className="size-4" strokeWidth={1.75} aria-hidden="true" />
                        {job.employment_type}
                      </span>
                    )}
                  </div>
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors duration-500 ease-out-expo group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                    <ArrowUpRight className="size-5 transition-transform duration-500 ease-out-expo group-hover:rotate-45" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </section>
    </MainLayout>
  );
};

export default Careers;
