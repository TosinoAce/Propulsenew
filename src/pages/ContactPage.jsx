import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight, ChevronDown, CircleCheck, Clock, Copy, Handshake, Mail, MapPin, MessageCircle, Phone,
} from "lucide-react";
import MainLayout from "../layout/MainLayout";
import Seo from "../components/Seo";
import Button from "../components/button";
import Field from "../components/Field";
import Reveal from "../components/Reveal";
import Select from "../components/Select";
import Magnetic from "../components/motion/Magnetic";
import Spotlight from "../components/motion/Spotlight";
import Tilt from "../components/motion/Tilt";
import { useAuth } from "../auth/AuthContext";
import { CONTACT, CONTACT_TOPICS } from "../lib/contact";
import { sendInquiry, toWhatsAppNumber, validateInquiry } from "../lib/inquiries";

const EASE = [0.16, 1, 0.3, 1];

const FAQS = [
  {
    question: "How do I find a property on Propulse?",
    answer:
      "Open the Properties page to browse every available listing. Search by name or location and filter by state, property type and budget, then open any listing to see its photos and full details.",
  },
  {
    question: "How do I contact the partner behind a listing?",
    answer:
      "Every property page names the verified partner handling it. Sign in, then use the Contact partner button to send an inquiry, or call or message them directly with the details on the listing.",
  },
  {
    question: "Can I list my own property on Propulse?",
    answer:
      "No. Propulse only lists properties from partners our team has verified, and our team adds every listing. If you are a developer or agency interested in partnering with us, send a message with the topic Becoming a partner.",
  },
  {
    question: "Can I save properties and come back to them later?",
    answer:
      "Yes. Create a free account, then tap Save for later on any property. Your saved listings are kept on the Saved Properties page, where you can review or remove them at any time.",
  },
];

/** A way to reach the team, as a card. `copy` adds a button that copies the value. */
const ChannelCard = ({ icon: Icon, label, value, href, external = false, copy = false, dark = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event) => {
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copying is a convenience; the link still works without it
    }
  };

  return (
    <Tilt max={5} className="h-full">
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={`group flex h-full flex-col justify-between gap-10 rounded-3xl p-6 shadow-card transition-shadow duration-500 hover:shadow-lift ${
          dark ? "bg-ink text-white" : "border border-line bg-panel text-ink"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <span className={`flex size-12 items-center justify-center rounded-2xl ${dark ? "bg-accent text-ink" : "bg-accent-soft text-accent-deep"}`}>
            <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <ArrowUpRight
            className={`size-5 transition-transform duration-500 ease-out-expo group-hover:rotate-45 ${dark ? "text-white/60" : "text-muted"}`}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>
        <div>
          <p className={`text-sm ${dark ? "text-white/60" : "text-muted"}`}>{label}</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="truncate text-lg font-semibold tracking-tight">{value}</p>
            {copy && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label={`Copy ${label.toLowerCase()}`}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm transition-colors duration-300 ${
                  dark ? "bg-white/10 hover:bg-white/20" : "bg-tint hover:bg-line"
                }`}
              >
                {copied ? <CircleCheck className="size-3.5" strokeWidth={2} aria-hidden="true" /> : <Copy className="size-3.5" strokeWidth={2} aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        </div>
      </a>
    </Tilt>
  );
};

/** One question in the FAQ, opening with a smooth height animation. */
const Question = ({ faq, open, onToggle, index }) => (
  <li className={`rounded-2xl border transition-colors duration-300 ${open ? "border-transparent bg-panel shadow-card" : "border-line hover:border-ink"}`}>
    <h3>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`faq-${index}`}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-lg font-medium text-ink"
      >
        {faq.question}
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${open ? "bg-ink text-white" : "bg-tint text-muted"}`}>
          <ChevronDown className={`size-4 transition-transform duration-300 ease-out-expo ${open ? "rotate-180" : ""}`} strokeWidth={2} aria-hidden="true" />
        </span>
      </button>
    </h3>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          id={`faq-${index}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="overflow-hidden"
        >
          <p className="max-w-[62ch] px-5 pb-5 leading-relaxed text-muted">{faq.answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </li>
);

const EMPTY_FORM = { name: "", email: "", phone: "", topic: CONTACT_TOPICS[0], message: "" };

const ContactPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    name: user?.user_metadata?.fullName ?? "",
    email: user?.email ?? "",
  }));
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [openFaq, setOpenFaq] = useState(0);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (status.state === "error") setStatus({ state: "idle", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status.state === "sending") return;

    const problem = validateInquiry(form);
    if (problem) {
      setStatus({ state: "error", message: problem });
      return;
    }

    setStatus({ state: "sending", message: "" });
    try {
      await sendInquiry({ ...form, user });
      setStatus({ state: "sent", message: "" });
    } catch (err) {
      console.error("Contact form failed:", err);
      setStatus({ state: "error", message: "We could not send your message. Please try again in a moment." });
    }
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM, name: form.name, email: form.email });
    setStatus({ state: "idle", message: "" });
  };

  const whatsappNumber = toWhatsAppNumber(CONTACT.whatsapp);

  return (
    <MainLayout>
      <Seo
        title="Contact us"
        description="Contact the Propulse team by WhatsApp, phone or email about buying property in Nigeria, becoming a partner, or land banking."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Propulse",
          mainEntity: {
            "@type": "RealEstateAgent",
            name: "Propulse",
            email: CONTACT.email,
            telephone: CONTACT.phone,
            address: { "@type": "PostalAddress", streetAddress: CONTACT.office, addressCountry: "NG" },
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer support",
              telephone: CONTACT.phone,
              email: CONTACT.email,
              areaServed: "NG",
              availableLanguage: ["English"],
            },
          },
        }}
      />
      {/* Opening */}
      <section className="shell pt-32 lg:pt-36">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent-deep">Contact</p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-tighter text-ink sm:text-6xl lg:text-7xl">
            Talk to the Propulse team.
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
            Questions about a property, about partnering with us, or about your account. Reach us
            the way that suits you, and we will get back to you within one working day.
          </p>
        </motion.div>

        {/* Ways to reach us */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MessageCircle, label: "WhatsApp", value: CONTACT.whatsapp, href: `https://wa.me/${whatsappNumber}`, external: true, dark: true },
            { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}`, copy: true },
            { icon: Phone, label: "Phone", value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`, copy: true },
            { icon: MapPin, label: "Office", value: CONTACT.office, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.office)}`, external: true },
          ].map((channel, index) => (
            <motion.div
              key={channel.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 + index * 0.08, ease: EASE }}
            >
              <ChannelCard {...channel} />
            </motion.div>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-2 text-muted">
          <Clock className="size-4" strokeWidth={1.75} aria-hidden="true" />
          {CONTACT.hours}
        </p>
      </section>

      {/* Form beside the frequently asked questions */}
      <section id="contact-form" className="shell grid scroll-mt-24 gap-12 pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <Reveal>
          <Spotlight className="rounded-3xl border border-line bg-panel p-6 shadow-card sm:p-10">
            <div className="relative">
              <AnimatePresence mode="wait">
                {status.state === "sent" ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="flex flex-col items-center gap-3 py-16 text-center"
                    role="status"
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                      className="flex size-16 items-center justify-center rounded-full bg-accent-soft text-success"
                    >
                      <CircleCheck className="size-8" strokeWidth={1.75} aria-hidden="true" />
                    </motion.span>
                    <h2 className="text-3xl font-semibold tracking-tight text-ink">Message sent</h2>
                    <p className="max-w-sm leading-relaxed text-muted">
                      Thank you, {form.name.split(" ")[0] || "there"}. We will reply to {form.email} within one working day.
                    </p>
                    <Button variant="secondary" className="mt-3" onClick={resetForm}>Send another message</Button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 className="text-3xl font-semibold tracking-tight text-ink">Send us a message</h2>
                    <p className="mt-2 text-muted">Tell us what it is about and we will route it to the right person.</p>

                    <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4">
                      <Field label="What is this about?">
                        {(props) => (
                          <Select {...props} value={form.topic} onChange={(value) => setForm((prev) => ({ ...prev, topic: value }))} options={CONTACT_TOPICS} />
                        )}
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Name">
                          {(props) => <input {...props} name="name" autoComplete="name" value={form.name} onChange={handleChange} />}
                        </Field>
                        <Field label="Phone number (optional)">
                          {(props) => <input {...props} type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={handleChange} />}
                        </Field>
                      </div>
                      <Field label="Email">
                        {(props) => <input {...props} type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} />}
                      </Field>
                      <Field label="Message">
                        {(props) => <textarea {...props} name="message" value={form.message} onChange={handleChange} />}
                      </Field>

                      {status.state === "error" && (
                        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{status.message}</p>
                      )}

                      <Magnetic strength={0.15} className="mt-2 w-full">
                        <Button type="submit" size="lg" className="w-full" disabled={status.state === "sending"}>
                          {status.state === "sending" ? "Sending..." : "Send message"}
                        </Button>
                      </Magnetic>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Spotlight>
        </Reveal>

        <div>
          <Reveal>
            <h2 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">Questions people ask</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <ul className="mt-8 flex flex-col gap-3">
              {FAQS.map((faq, index) => (
                <Question
                  key={faq.question}
                  faq={faq}
                  index={index}
                  open={openFaq === index}
                  onToggle={() => setOpenFaq((current) => (current === index ? -1 : index))}
                />
              ))}
            </ul>
          </Reveal>

          {/* For firms that want to become partners */}
          <Reveal delay={0.12} className="mt-6">
            <Spotlight tone="dark" className="rounded-3xl bg-ink p-6 text-white sm:p-8">
              <div className="relative flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-ink">
                    <Handshake className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">Developer or agency?</h3>
                    <p className="mt-1 max-w-[40ch] leading-relaxed text-white/70">
                      We are always looking for trustworthy partners across Nigeria.
                    </p>
                  </div>
                </div>
                <Button
                  variant="accent"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, topic: "Becoming a partner" }));
                    setStatus({ state: "idle", message: "" });
                    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Partner with us
                </Button>
              </div>
            </Spotlight>
          </Reveal>

          <p className="mt-6 text-muted">
            Looking for a job instead?{" "}
            <Link to="/careers" className="font-medium text-accent-deep underline underline-offset-2">See open roles</Link>
          </p>
        </div>
      </section>
    </MainLayout>
  );
};

export default ContactPage;
