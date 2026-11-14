import { motion } from "motion/react";

/** Title block that opens every inner page, with a short entry animation. */
const PageHeader = ({ title, text, children }) => (
  <motion.header
    className="shell pb-10 pt-32 sm:pt-36"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
  >
    <h1 className="max-w-3xl text-4xl font-semibold tracking-tighter text-ink sm:text-5xl lg:text-6xl">
      {title}
    </h1>
    {text && <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted">{text}</p>}
    {children}
  </motion.header>
);

export default PageHeader;
