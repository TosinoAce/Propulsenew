import { useState } from "react";
import { motion } from "motion/react";
import { CircleCheck, Landmark, ShieldCheck, TrendingUp } from "lucide-react";
import MainLayout from "../layout/MainLayout";
import Seo from "../components/Seo";
import Button from "../components/button";
import Field from "../components/Field";
import Reveal from "../components/Reveal";
import ParallaxImage from "../components/motion/ParallaxImage";
import Spotlight from "../components/motion/Spotlight";
import { useAuth } from "../auth/AuthContext";
import { sendInquiry, validateInquiry } from "../lib/inquiries";

const EASE = [0.16, 1, 0.3, 1];

const POINTS = [
  {
    icon: Landmark,
    title: "Buy land early",
    text: "Secure plots in growing areas before development pushes prices up.",
  },
  {
    icon: TrendingUp,
    title: "Hold while it appreciates",
    text: "Land banking is a long-term approach: you keep the land as the area around it develops.",
  },
  {
    icon: ShieldCheck,
    title: "Know what you own",
    text: "We plan to show clear documents and plot details for every land banking option.",
  },
];

const LandBanking = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.user_metadata?.fullName ?? "",
    email: user?.email ?? "",
  });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (status.state === "error") setStatus({ state: "idle", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status.state === "sending") return;

    const payload = { ...form, message: "Please notify me when Land Banking launches." };
    const validationError = validateInquiry(payload);
    if (validationError) {
      setStatus({ state: "error", message: validationError });
      return;
    }

    setStatus({ state: "sending", message: "" });
    try {
      await sendInquiry({ ...payload, user, topic: "Land banking waitlist" });
      setStatus({ state: "sent", message: "" });
    } catch (err) {
      console.error("Waitlist signup failed:", err);
      setStatus({ state: "error", message: "We could not add you to the list. Please try again in a moment." });
    }
  };

  return (
    <MainLayout>
      <Seo
        title="Land banking in Nigeria"
        description="Land banking with Propulse: buy land in growing areas of Nigeria and hold it as the area develops. Join the waitlist to hear when it opens."
        image="/photos/land-plots-1280.webp"
      />
      <section className="shell grid gap-12 pb-4 pt-32 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20 lg:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent-deep">Coming soon</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tighter text-ink sm:text-6xl">
            Land banking is on the way
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
            We are building a way to buy land in growing areas and hold it for the long term. Leave
            your details and we will tell you the day it opens.
          </p>

          <Spotlight className="mt-10 max-w-xl rounded-3xl border border-line bg-panel p-6 shadow-card sm:p-8">
            <div className="relative">
            {status.state === "sent" ? (
              <div className="flex items-start gap-4" role="status">
                <CircleCheck className="size-8 shrink-0 text-success" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <h2 className="text-xl font-semibold text-ink">You are on the list</h2>
                  <p className="mt-1 leading-relaxed text-muted">
                    We will email you as soon as Land Banking launches.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    {(props) => (
                      <input {...props} name="name" autoComplete="name" value={form.name} onChange={handleChange} />
                    )}
                  </Field>
                  <Field label="Email">
                    {(props) => (
                      <input {...props} type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} />
                    )}
                  </Field>
                </div>
                {status.state === "error" && (
                  <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                    {status.message}
                  </p>
                )}
                <Button type="submit" size="lg" disabled={status.state === "sending"}>
                  {status.state === "sending" ? "Adding you..." : "Notify me"}
                </Button>
              </form>
            )}
            </div>
          </Spotlight>
        </motion.div>

        <motion.div
          className="overflow-hidden rounded-3xl bg-tint"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: EASE }}
        >
          <ParallaxImage
            src="/photos/land-plots.jpg"
            alt="Serviced plots of green land divided by new roads, with hills behind"
            className="aspect-[4/5]"
            shift={5}
          />
        </motion.div>
      </section>

      <section className="shell pt-24">
        <Reveal>
          <h2 className="max-w-2xl text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">
            What land banking means
          </h2>
        </Reveal>
        <ul className="mt-12 grid gap-10 md:grid-cols-3">
          {POINTS.map((point, index) => (
            <Reveal as="li" key={point.title} delay={index * 0.08} className="border-t border-line pt-6">
              <point.icon className="size-8 text-accent-deep" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-semibold tracking-tight text-ink">{point.title}</h3>
              <p className="mt-2 max-w-[40ch] leading-relaxed text-muted">{point.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>
    </MainLayout>
  );
};

export default LandBanking;
