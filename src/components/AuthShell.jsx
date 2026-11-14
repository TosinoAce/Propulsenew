import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/** Two-panel frame shared by the sign in and sign up pages: photo on one side, form on the other. */
const AuthShell = ({ title, text, footer, children }) => (
  <div className="grid min-h-[100dvh] lg:grid-cols-2">
    <div className="relative hidden overflow-hidden lg:block">
      {/* The photo eases back as the page opens */}
      <motion.img
        src="/image.png"
        alt="A yellow bungalow with a covered porch and a wide front lawn"
        className="absolute inset-0 size-full object-cover"
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" aria-hidden="true" />
      <motion.p
        className="absolute inset-x-12 bottom-12 max-w-md text-3xl font-medium leading-tight tracking-tight text-white"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
      >
        Land and homes across Kwara and Lagos State, with the realtor one message away.
      </motion.p>
    </div>

    <div className="flex flex-col px-5 py-8 sm:px-12">
      <Link to="/" aria-label="Propulse home" className="self-start">
        <img src="/propulseLogo.png" alt="Propulse" className="h-14 w-auto" />
      </Link>

      <motion.div
        className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <h1 className="text-4xl font-semibold tracking-tighter text-ink">{title}</h1>
        {text && <p className="mt-3 text-lg leading-relaxed text-muted">{text}</p>}
        <div className="mt-8">{children}</div>
        {footer && <p className="mt-8 text-muted">{footer}</p>}
      </motion.div>
    </div>
  </div>
);

/** Password input with a show / hide control. Spread the props from <Field> onto it. */
export const PasswordInput = ({ className = "", ...props }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${className} !pr-12`} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors duration-300 hover:text-ink"
      >
        {visible ? (
          <EyeOff className="size-5" strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Eye className="size-5" strokeWidth={1.75} aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

export default AuthShell;
