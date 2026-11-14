import { useState } from "react";
import { ChevronDown, CircleCheck, Headset, MessageSquareText } from "lucide-react";
import MainLayout from "../layout/MainLayout";
import Button from "../components/button";
import Field from "../components/Field";
import PageHeader from "../components/PageHeader";
import Reveal from "../components/Reveal";
import Magnetic from "../components/motion/Magnetic";
import Spotlight from "../components/motion/Spotlight";
import { useAuth } from "../auth/AuthContext";
import { sendInquiry, validateInquiry } from "../lib/inquiries";

const EMPTY_FORM = { name: "", email: "", phone: "", message: "" };

const SUPPORT = [
  {
    icon: Headset,
    title: "Customer support",
    text: "Our support team is always available to address any concerns or queries you might have.",
  },
  {
    icon: MessageSquareText,
    title: "Feedback and suggestions",
    text: "Your feedback is very important to us, as it helps us improve and shape the future of Propulse.",
  },
];

const FAQS = [
  {
    question: "How do I find a property on Propulse?",
    answer:
      "Open the Properties page to browse every available listing. You can search by name or location and filter by state, property type and budget, then open any listing to see its full details.",
  },
  {
    question: "How do I contact a realtor?",
    answer:
      "Every property page names the realtor handling it. Use the Contact realtor button to send an inquiry, or call or message the realtor directly with the phone number on the listing.",
  },
  {
    question: "Can I save properties and come back to them later?",
    answer:
      "Yes. Create a free account, then tap Save for later on any property. Your saved listings are kept on the Saved Properties page, where you can review or remove them at any time.",
  },
];

const ContactPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (status.state !== "idle") setStatus({ state: "idle", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status.state === "sending") return;

    const validationError = validateInquiry(form);
    if (validationError) {
      setStatus({ state: "error", message: validationError });
      return;
    }

    setStatus({ state: "sending", message: "" });
    try {
      await sendInquiry({ ...form, user });
      setForm(EMPTY_FORM);
      setStatus({ state: "sent", message: "" });
    } catch (err) {
      console.error("Contact form failed:", err);
      setStatus({ state: "error", message: "We could not send your message. Please try again in a moment." });
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Get in touch"
        text="Looking for land or a house, need advice on a location, or have a question? Send us a message and our team will respond quickly."
      />

      <section className="shell grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <ul className="flex flex-col">
            {SUPPORT.map((entry, index) => (
              <Reveal
                as="li"
                key={entry.title}
                delay={index * 0.08}
                className="flex gap-5 border-t border-line py-7 first:border-t-0 first:pt-0"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
                  <entry.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-ink">{entry.title}</h2>
                  <p className="mt-1.5 max-w-[46ch] leading-relaxed text-muted">{entry.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal className="mt-14">
            <h2 className="text-3xl font-semibold tracking-tighter text-ink">Frequently asked questions</h2>
            <div className="mt-6 flex flex-col gap-3">
              {FAQS.map((faq) => (
                <details key={faq.question} className="group rounded-2xl border border-line bg-panel px-5 transition duration-300 ease-out-expo hover:border-ink open:shadow-card">
                  <summary className="flex list-none items-center justify-between gap-4 py-4 text-lg font-medium text-ink [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown
                      className="size-5 shrink-0 text-muted transition-transform duration-300 ease-out-expo group-open:rotate-180"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="max-w-[60ch] pb-5 leading-relaxed text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:self-start">
          <Spotlight className="rounded-3xl border border-line bg-panel p-6 shadow-card sm:p-8">
            <div className="relative">
            {status.state === "sent" ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center" role="status">
                <CircleCheck className="size-12 text-success" strokeWidth={1.5} aria-hidden="true" />
                <h2 className="text-2xl font-semibold tracking-tight text-ink">Message sent</h2>
                <p className="max-w-sm leading-relaxed text-muted">
                  Thank you for reaching out. We will get back to you soon.
                </p>
                <Button variant="secondary" className="mt-3" onClick={() => setStatus({ state: "idle", message: "" })}>
                  Send another message
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold tracking-tight text-ink">Send us a message</h2>
                <p className="mt-1 text-muted">You can reach us anytime.</p>

                <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
                  <Field label="Name">
                    {(props) => (
                      <input {...props} name="name" autoComplete="name" value={form.name} onChange={handleChange} />
                    )}
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email">
                      {(props) => (
                        <input {...props} type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} />
                      )}
                    </Field>
                    <Field label="Phone number">
                      {(props) => (
                        <input {...props} type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={handleChange} />
                      )}
                    </Field>
                  </div>
                  <Field label="Message">
                    {(props) => (
                      <textarea {...props} name="message" value={form.message} onChange={handleChange} />
                    )}
                  </Field>

                  {status.state === "error" && (
                    <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                      {status.message}
                    </p>
                  )}

                  <Magnetic strength={0.15} className="mt-2 w-full">
                    <Button type="submit" size="lg" className="w-full" disabled={status.state === "sending"}>
                      {status.state === "sending" ? "Sending..." : "Send message"}
                    </Button>
                  </Magnetic>
                </form>
              </>
            )}
            </div>
          </Spotlight>
        </Reveal>
      </section>
    </MainLayout>
  );
};

export default ContactPage;
