import Reveal from "./Reveal";

/** Centred message for empty, error and signed-out states. `children` holds the actions. */
const EmptyState = ({ icon: Icon, title, text, children, className = "" }) => (
  <Reveal className={`mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center ${className}`}>
    {Icon && (
      <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
        <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
      </div>
    )}
    <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
    {text && <p className="leading-relaxed text-muted">{text}</p>}
    {children && <div className="mt-3 flex flex-wrap justify-center gap-3">{children}</div>}
  </Reveal>
);

export default EmptyState;
