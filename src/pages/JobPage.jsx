import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, CircleCheck, Clock, MapPin, SearchX, Users } from "lucide-react";
import supabase from "../lib/supabase";
import MainLayout from "../layout/MainLayout";
import Seo, { absoluteUrl, breadcrumbs } from "../components/Seo";
import Button from "../components/button";
import EmptyState from "../components/EmptyState";
import Field from "../components/Field";
import Reveal from "../components/Reveal";
import RichText from "../components/RichText";
import Magnetic from "../components/motion/Magnetic";
import Spotlight from "../components/motion/Spotlight";

const EASE = [0.16, 1, 0.3, 1];
const EMPTY_FORM = { name: "", email: "", phone: "", cv_link: "", message: "" };

const validate = (form) => {
  if (!form.name.trim()) return "Please enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Please enter a valid email address.";
  if (!form.cv_link.trim()) return "Please add a link to your CV or portfolio.";
  if (!/^https?:\/\/\S+\.\S+/i.test(form.cv_link.trim())) return "The CV link should start with https://";
  return null;
};

/** One open role, with its full description and an application form. */
const JobPage = () => {
  const { slug } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("jobs")
      .select("*")
      .eq("slug", slug)
      .eq("is_open", true)
      .maybeSingle()
      .then(({ data, error: loadError }) => {
        if (!active) return;
        if (loadError) {
          console.error("Failed to load job:", loadError);
          setError(true);
        } else {
          setJob(data);
        }
        setLoading(false);
      });
    return () => { active = false; };
  }, [slug]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (status.state === "error") setStatus({ state: "idle", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status.state === "sending") return;

    const problem = validate(form);
    if (problem) {
      setStatus({ state: "error", message: problem });
      return;
    }

    setStatus({ state: "sending", message: "" });
    const { error: sendError } = await supabase.from("job_applications").insert({
      job_id: job.id,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      cv_link: form.cv_link.trim(),
      message: form.message.trim() || null,
    });

    if (sendError) {
      console.error("Application failed:", sendError);
      setStatus({ state: "error", message: "We could not send your application. Please try again in a moment." });
      return;
    }
    setStatus({ state: "sent", message: "" });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="shell min-h-[100dvh] pt-32" aria-hidden="true">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton mt-6 h-14 w-2/3 max-w-xl" />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div className="skeleton h-96 !rounded-3xl" />
            <div className="skeleton h-96 !rounded-3xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !job) {
    return (
      <MainLayout>
        <div className="shell pt-28">
          <EmptyState
            icon={SearchX}
            title={error ? "Something went wrong" : "This role is closed"}
            text={error ? "We could not load this role. Please try again." : "The role may have been filled. See what else is open."}
          >
            <Button to="/careers">See open roles</Button>
          </EmptyState>
        </div>
      </MainLayout>
    );
  }

  const remote = /remote/i.test(job.location ?? "");
  const employmentType = {
    "Full-time": "FULL_TIME",
    "Part-time": "PART_TIME",
    Contract: "CONTRACTOR",
    Internship: "INTERN",
  }[job.employment_type];

  const facts = [
    job.team && { icon: Users, label: job.team },
    job.location && { icon: MapPin, label: job.location },
    job.employment_type && { icon: Clock, label: job.employment_type },
  ].filter(Boolean);

  return (
    <MainLayout>
      <Seo
        title={`${job.title}${job.location ? `, ${job.location}` : ""}`}
        description={job.summary ?? `${job.title} at Propulse.`}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: job.title,
            description: job.body.replace(/^## /gm, "").replace(/\n/g, "<br>"),
            datePosted: job.created_at,
            employmentType,
            directApply: true,
            hiringOrganization: {
              "@type": "Organization",
              name: "Propulse",
              sameAs: absoluteUrl("/"),
              logo: absoluteUrl("/icon-512.png"),
            },
            ...(remote
              ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "Nigeria" } }
              : {
                  jobLocation: {
                    "@type": "Place",
                    address: { "@type": "PostalAddress", addressLocality: job.location?.split(",")[0], addressCountry: "NG" },
                  },
                }),
          },
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Careers", path: "/careers" },
            { name: job.title, path: `/careers/${job.slug}` },
          ]),
        ]}
      />
      <motion.header
        className="shell pt-32"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <Link to="/careers#open-roles" className="inline-flex items-center gap-2 text-muted transition-colors duration-300 hover:text-ink">
          <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
          All open roles
        </Link>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tighter text-ink sm:text-6xl">{job.title}</h1>
        {job.summary && <p className="mt-5 max-w-[60ch] text-xl leading-relaxed text-muted">{job.summary}</p>}
        <ul className="mt-6 flex flex-wrap gap-2">
          {facts.map((fact) => (
            <li key={fact.label} className="flex items-center gap-1.5 rounded-full border border-line bg-panel px-4 py-2 text-ink">
              <fact.icon className="size-4 text-accent-deep" strokeWidth={1.75} aria-hidden="true" />
              {fact.label}
            </li>
          ))}
        </ul>
      </motion.header>

      <div className="shell mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <Reveal>
          <RichText source={job.body} />
        </Reveal>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Reveal delay={0.1}>
            <Spotlight className="rounded-3xl border border-line bg-panel p-6 shadow-card sm:p-8">
              <div className="relative">
                {status.state === "sent" ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center" role="status">
                    <CircleCheck className="size-12 text-success" strokeWidth={1.5} aria-hidden="true" />
                    <h2 className="text-2xl font-semibold tracking-tight text-ink">Application sent</h2>
                    <p className="max-w-sm leading-relaxed text-muted">
                      Thank you for applying for {job.title}. Our team will review it and be in touch.
                    </p>
                    <Button to="/careers" variant="secondary" className="mt-3">See other roles</Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold tracking-tight text-ink">Apply for this role</h2>
                    <p className="mt-1 text-muted">It takes about two minutes.</p>
                    <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
                      <Field label="Full name">
                        {(props) => <input {...props} name="name" autoComplete="name" value={form.name} onChange={handleChange} />}
                      </Field>
                      <Field label="Email">
                        {(props) => <input {...props} type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} />}
                      </Field>
                      <Field label="Phone number">
                        {(props) => <input {...props} type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={handleChange} />}
                      </Field>
                      <Field label="Link to your CV or portfolio" hint="A Google Drive, Dropbox or LinkedIn link that anyone with the link can open.">
                        {(props) => <input {...props} type="url" name="cv_link" placeholder="https://" value={form.cv_link} onChange={handleChange} />}
                      </Field>
                      <Field label="Why this role? (optional)">
                        {(props) => <textarea {...props} name="message" value={form.message} onChange={handleChange} />}
                      </Field>

                      {status.state === "error" && (
                        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{status.message}</p>
                      )}

                      <Magnetic strength={0.15} className="mt-2 w-full">
                        <Button type="submit" size="lg" className="w-full" disabled={status.state === "sending"}>
                          {status.state === "sending" ? "Sending..." : "Send application"}
                        </Button>
                      </Magnetic>
                    </form>
                  </>
                )}
              </div>
            </Spotlight>
          </Reveal>
        </aside>
      </div>
    </MainLayout>
  );
};

export default JobPage;
