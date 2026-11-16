import { Link } from "react-router-dom";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap " +
  "transition duration-300 ease-out-expo hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-50";

const VARIANTS = {
  primary: "bg-ink text-white hover:bg-ink-soft",
  accent: "bg-accent text-ink hover:brightness-105",
  secondary: "border border-line bg-panel text-ink hover:border-ink",
  ghost: "text-ink hover:bg-tint",
  danger: "border border-line bg-panel text-danger hover:border-danger",
};

const SIZES = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[15px]",
  lg: "h-12 px-7 text-base",
};

/**
 * The one button used across the site.
 * Pass `to` for an internal link, `href` for an external one, otherwise it renders a <button>.
 */
const Button = ({ to, href, variant = "primary", size = "md", className = "", children, ...rest }) => {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (to) {
    return <Link to={to} className={classes} {...rest}>{children}</Link>;
  }
  if (href) {
    return <a href={href} className={classes} {...rest}>{children}</a>;
  }
  return <button type="button" className={classes} {...rest}>{children}</button>;
};

export default Button;
