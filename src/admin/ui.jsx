import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { checkImage, uploadImage } from "../lib/upload";
import { describeError } from "./errors";

const EASE = [0.16, 1, 0.3, 1];

/** Title row at the top of an admin screen. `children` holds the screen's main action. */
export const AdminHeader = ({ title, text, children }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4 rounded-3xl bg-tint px-6 py-7 sm:px-8">
    <div>
      <h1 className="text-3xl font-semibold tracking-tighter text-ink sm:text-4xl">{title}</h1>
      {text && <p className="mt-2 max-w-[60ch] text-muted">{text}</p>}
    </div>
    {children}
  </div>
);

/** Inline message for a failed load or save. */
export const ErrorNote = ({ children }) =>
  children ? (
    <p role="alert" className="mb-6 rounded-xl bg-danger/10 px-4 py-3 text-danger">{children}</p>
  ) : null;

/**
 * Panel that slides in from the right for adding and editing. Escape and the
 * backdrop close it, and the page behind stops scrolling while it is open.
 */
export const Drawer = ({ open, title, onClose, children }) => {
  useEffect(() => {
    if (!open) return;

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
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end bg-ink/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="flex h-full w-full max-w-2xl flex-col bg-panel shadow-lift"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex size-10 items-center justify-center rounded-full border border-line transition-colors duration-300 hover:border-ink"
              >
                <X className="size-4" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** On/off switch with its label. */
export const Toggle = ({ label, hint, checked, onChange }) => (
  <label className="group flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-line px-4 py-3">
    <span>
      <span className="block font-medium text-ink">{label}</span>
      {hint && <span className="mt-0.5 block text-sm text-muted">{hint}</span>}
    </span>
    <input
      type="checkbox"
      className="sr-only"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
    <span
      aria-hidden="true"
      className="mt-1 flex h-6 w-11 shrink-0 items-center rounded-full bg-line p-0.5 transition-colors duration-300 group-has-[:checked]:bg-ink group-has-[:focus-visible]:outline group-has-[:focus-visible]:outline-2 group-has-[:focus-visible]:outline-offset-2 group-has-[:focus-visible]:outline-accent-deep"
    >
      <span className="size-5 rounded-full bg-panel shadow-card transition-transform duration-300 ease-out-expo group-has-[:checked]:translate-x-5" />
    </span>
  </label>
);

/**
 * Picks images and uploads them straight away. `multiple` allows several at once.
 * `onUploaded` receives the public address of each finished upload.
 */
export const ImagePicker = ({ label, folder, multiple = false, onUploaded }) => {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");

  const handleFiles = async (event) => {
    const files = [...event.target.files];
    event.target.value = "";
    if (files.length === 0) return;

    const invalid = files.map(checkImage).find(Boolean);
    if (invalid) {
      setProblem(invalid);
      return;
    }

    setBusy(true);
    setProblem("");
    try {
      for (const file of files) {
        onUploaded(await uploadImage(file, folder));
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setProblem(describeError(error, "The upload did not finish. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        multiple={multiple}
        className="sr-only"
        onChange={handleFiles}
        aria-label={label}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-dashed border-muted px-5 text-[15px] text-ink transition-colors duration-300 hover:border-ink disabled:opacity-60"
      >
        {busy ? (
          <LoaderCircle className="size-4 animate-spin" strokeWidth={2} aria-hidden="true" />
        ) : (
          <ImagePlus className="size-4" strokeWidth={1.75} aria-hidden="true" />
        )}
        {busy ? "Uploading..." : label}
      </button>
      {problem && <p className="mt-2 text-sm text-danger" role="alert">{problem}</p>}
    </div>
  );
};
