import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import {
  Briefcase, Building2, Handshake, Inbox, LayoutDashboard, LogOut, Newspaper, ShieldAlert, SquareArrowOutUpRight,
} from "lucide-react";
import supabase from "../lib/supabase";
import { getInitials } from "../lib/constants";
import BrandMark from "../components/BrandMark";
import Button from "../components/button";
import EmptyState from "../components/EmptyState";
import Seo from "../components/Seo";
import { useAuth } from "../auth/AuthContext";
import { authLink } from "../lib/redirect";

const SECTIONS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/partners", label: "Partners", icon: Handshake },
  { to: "/admin/properties", label: "Properties", icon: Building2 },
  { to: "/admin/inquiries", label: "Inquiries", icon: Inbox, badge: true },
  { to: "/admin/blog", label: "Blog", icon: Newspaper },
  { to: "/admin/careers", label: "Careers", icon: Briefcase },
];

/** Number of inquiries still marked new, refreshed whenever the admin moves between screens. */
const useNewInquiryCount = (pathname) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new")
      .then(({ count: total, error }) => {
        if (active && !error) setCount(total ?? 0);
      });
    return () => { active = false; };
  }, [pathname]);

  return count;
};

/** Side navigation, shared by the desktop sidebar and the mobile top strip. */
const SectionLinks = ({ newCount, compact = false }) =>
  SECTIONS.map((section) => (
    <NavLink
      key={section.to}
      to={section.to}
      end={section.end}
      className={({ isActive }) =>
        `relative flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-[15px] transition-colors duration-300 ${
          isActive ? "text-ink" : compact ? "text-muted hover:text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId={compact ? "admin-nav-compact" : "admin-nav"}
              className={`absolute inset-0 rounded-2xl ${compact ? "bg-panel shadow-card" : "bg-accent"}`}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
            />
          )}
          <section.icon className="relative size-5" strokeWidth={1.75} aria-hidden="true" />
          <span className="relative">{section.label}</span>
          {section.badge && newCount > 0 && (
            <span
              className={`relative ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${
                isActive ? "bg-ink text-white" : "bg-accent text-ink"
              }`}
            >
              {newCount}
            </span>
          )}
        </>
      )}
    </NavLink>
  ));

/**
 * Frame for every admin screen. It lets only Propulse admins through: signed-out
 * visitors are sent to sign in, and other accounts see a "no access" message.
 * The database applies the same rule, so this check is for the interface only.
 */
const AdminLayout = () => {
  const { user, isAdmin, isAdminLoading, handleLogout } = useAuth();
  const location = useLocation();
  const newCount = useNewInquiryCount(location.pathname);

  if (isAdminLoading) {
    return (
      <div className="flex min-h-[100dvh] gap-4 p-4" aria-busy="true" aria-label="Checking access">
        <div className="skeleton hidden w-72 !rounded-3xl lg:block" />
        <div className="flex flex-1 flex-col gap-4">
          <div className="skeleton h-40 !rounded-3xl" />
          <div className="skeleton h-64 !rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to={authLink(location.pathname)} replace />;

  if (!isAdmin) {
    return (
      <div className="shell flex min-h-[100dvh] items-center justify-center">
        <EmptyState
          icon={ShieldAlert}
          title="This area is for the Propulse team"
          text="Your account does not have admin access. If you think it should, ask a Propulse admin to enable it."
        >
          <Button to="/">Back to home</Button>
        </EmptyState>
      </div>
    );
  }

  const displayName = user.user_metadata?.fullName || user.email?.split("@")[0] || "Admin";

  return (
    <div className="min-h-[100dvh] bg-surface lg:flex lg:gap-4 lg:p-4">
      <Seo title="Admin" noindex />
      {/* Desktop sidebar: a dark panel that stays in place */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-4 flex h-[calc(100dvh-2rem)] flex-col rounded-3xl bg-ink p-5 text-white">
          <Link to="/admin" className="flex items-center gap-3 px-2 pt-1" aria-label="Admin overview">
            <BrandMark roof="#fdfefd" className="w-11" />
            <span>
              <span className="block text-lg font-semibold leading-tight tracking-tight">Propulse</span>
              <span className="block text-sm text-white/55">Admin</span>
            </span>
          </Link>

          <nav aria-label="Admin sections" className="mt-10 flex flex-col gap-1">
            <SectionLinks newCount={newCount} />
          </nav>

          <div className="mt-auto flex flex-col gap-2 border-t border-white/15 pt-5">
            <div className="flex items-center gap-3 px-2 pb-2">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
                {getInitials(displayName)}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{displayName}</span>
                <span className="block truncate text-sm text-white/55">{user.email}</span>
              </span>
            </div>
            <Link to="/" className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[15px] text-white/70 transition-colors duration-300 hover:bg-white/10 hover:text-white">
              <SquareArrowOutUpRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
              View site
            </Link>
            <button type="button" onClick={handleLogout} className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-[15px] text-white/70 transition-colors duration-300 hover:bg-white/10 hover:text-white">
              <LogOut className="size-4" strokeWidth={1.75} aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header and section strip */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <Link to="/admin" className="flex items-center gap-2" aria-label="Admin overview">
            <BrandMark className="w-9 text-ink" />
            <span className="font-semibold">Propulse Admin</span>
          </Link>
          <div className="flex gap-2">
            <Button to="/" variant="ghost" size="sm" aria-label="View site">
              <SquareArrowOutUpRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </Button>
            <Button variant="secondary" size="sm" onClick={handleLogout} aria-label="Logout">
              <LogOut className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </Button>
          </div>
        </div>
        <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto bg-tint px-3 py-2">
          <SectionLinks newCount={newCount} compact />
        </nav>
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 lg:px-6 lg:py-4">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-6xl"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default AdminLayout;
