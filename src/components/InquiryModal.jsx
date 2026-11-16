import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CircleCheck, X } from "lucide-react";
import Button from "./button";
import Field from "./Field";
import { sendInquiry, validateInquiry } from "../lib/inquiries";

const EASE = [0.16, 1, 0.3, 1];

/** Dialog for sending a message to the realtor of one property. Render inside <AnimatePresence>. */
const InquiryModal = ({ property, user, onClose }) => {
  const [form, setForm] = useState({
    name: user?.user_metadata?.fullName ?? "",
    email: user?.email ?? "",
    phone: "",
    message: `I am making an enquiry on ${property.propertyName} located at ${property.propertyLocation}.`,
  });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  // Escape closes the dialog, and the page behind it stops scrolling while it is open
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      await sendInquiry({ ...form, property, user });
      setStatus({ state: "sent", message: "" });
    } catch (err) {
      console.error("Inquiry failed:", err);
      setStatus({
        state: "error",
        message: property.realtorContact
          ? `We could not send your inquiry. Please call the partner directly on ${property.realtorContact}.`
          : "We could not send your inquiry. Please try again.",
      });
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-title"
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-panel p-6 shadow-lift sm:rounded-3xl sm:p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.45, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="inquiry-title" className="text-2xl font-semibold tracking-tight text-ink">
              Contact the partner
            </h2>
            <p className="mt-1 text-muted">
              {property.partner?.name || property.realtorName
                ? `Your message goes to ${property.partner?.name || property.realtorName}.`
                : "Your message goes to the partner for this property."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line transition-colors duration-300 hover:border-ink"
          >
            <X className="size-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        {status.state === "sent" ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <CircleCheck className="size-12 text-success" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="text-xl font-semibold text-ink">Inquiry sent</h3>
            <p className="max-w-sm leading-relaxed text-muted">
              Your message about {property.propertyName} is on its way. The partner will get back
              to you soon.
            </p>
            <Button className="mt-3" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
            <Field label="Your name">
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

            <div className="mt-2 flex flex-wrap justify-end gap-3">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={status.state === "sending"}>
                {status.state === "sending" ? "Sending..." : "Send inquiry"}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default InquiryModal;
