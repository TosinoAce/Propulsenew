import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ChevronDown, Heart, LogOut, Mail, Menu, X } from "lucide-react";
import Button from "./button";
import { useAuth } from "../auth/AuthContext";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/property", label: "Properties" },
  { to: "/landbanking", label: "Land Banking" },
  { to: "/about", label: "About Us" },
];

const EASE = [0.16, 1, 0.3, 1];

const getInitials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const Navbar = () => {
  const { user, isAuthLoading, handleLogout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  // The bar is transparent over the top of the page and gains a surface once the page scrolls
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 12));

  // Close any open menu when the route changes
  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close the account menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const displayName =
    user?.user_metadata?.fullName || user?.email?.split("@")[0] || "Account";

  const solid = scrolled || mobileOpen;

  const linkClass = ({ isActive }) =>
    `relative py-2 text-[15px] transition-colors duration-300 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:rounded-full after:bg-accent after:transition-transform after:duration-300 after:ease-out-expo ${
      isActive
        ? "font-medium text-ink after:scale-x-100"
        : "text-muted hover:text-ink after:scale-x-0 hover:after:scale-x-100"
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${
        solid ? "border-line bg-surface/90 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div className="shell flex h-[72px] items-center justify-between gap-6">
        <Link to="/" aria-label="Propulse home" className="shrink-0">
          <img src="/propulseLogo.png" alt="Propulse" className="h-14 w-auto" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2.5 rounded-full border border-line bg-panel py-1.5 pl-1.5 pr-3 text-[15px] transition-colors duration-300 hover:border-ink"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
                  {getInitials(displayName)}
                </span>
                <span className="max-w-36 truncate">{displayName}</span>
                <ChevronDown
                  className={`size-4 text-muted transition-transform duration-300 ${menuOpen ? "rotate-180" : ""}`}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="absolute right-0 top-full mt-2 w-60 origin-top-right rounded-2xl border border-line bg-panel p-2 shadow-lift"
                  >
                    <Link role="menuitem" to="/savedproperties" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] hover:bg-tint">
                      <Heart className="size-4 text-muted" strokeWidth={1.75} aria-hidden="true" />
                      Saved Properties
                    </Link>
                    <Link role="menuitem" to="/contact" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] hover:bg-tint">
                      <Mail className="size-4 text-muted" strokeWidth={1.75} aria-hidden="true" />
                      Get in Touch
                    </Link>
                    <button
                      role="menuitem"
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl border-t border-line px-3 py-2.5 text-left text-[15px] hover:bg-tint"
                    >
                      <LogOut className="size-4 text-muted" strokeWidth={1.75} aria-hidden="true" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            !isAuthLoading && (
              <>
                <Button to="/login" variant="ghost" size="sm">Sign in</Button>
                <Button to="/signup" size="sm">Get started</Button>
              </>
            )
          )}
        </div>

        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full border border-line bg-panel lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? (
            <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Menu className="size-5" strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="border-t border-line bg-surface lg:hidden"
          >
            <nav aria-label="Mobile" className="shell flex flex-col py-4">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `border-b border-line py-3.5 text-lg ${isActive ? "font-medium text-ink" : "text-muted"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {user ? (
                <>
                  <NavLink to="/savedproperties" className="border-b border-line py-3.5 text-lg text-muted">
                    Saved Properties
                  </NavLink>
                  <NavLink to="/contact" className="border-b border-line py-3.5 text-lg text-muted">
                    Get in Touch
                  </NavLink>
                  <div className="flex items-center justify-between gap-4 pt-5">
                    <p className="truncate text-muted">Signed in as <span className="text-ink">{displayName}</span></p>
                    <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
                  </div>
                </>
              ) : (
                <>
                  <NavLink to="/contact" className="border-b border-line py-3.5 text-lg text-muted">
                    Get in Touch
                  </NavLink>
                  {!isAuthLoading && (
                    <div className="grid grid-cols-2 gap-3 pt-5">
                      <Button to="/login" variant="secondary">Sign in</Button>
                      <Button to="/signup">Get started</Button>
                    </div>
                  )}
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
