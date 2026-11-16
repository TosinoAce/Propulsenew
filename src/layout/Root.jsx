import { Suspense, useEffect, useState } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { AuthProvider, useAuth } from "../auth/AuthContext";
import Preloader from "../components/Preloader";

// Long enough for the opening animation to finish drawing
const MIN_PRELOADER_MS = 2100;
const SEEN_KEY = "propulse-intro-seen";

// The opening animation plays once per visit. Moving between pages, or reloading in the
// same tab, goes straight to the page so returning visitors are not kept waiting.
const introAlreadySeen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
};

const markIntroSeen = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Private browsing can block storage; the intro will simply play again next time
  }
};

/** Shown for the moment a page's code is still downloading. */
const PageFallback = () => (
  <div className="shell flex min-h-[100dvh] flex-col gap-4 pt-28" aria-busy="true" aria-label="Loading page">
    <div className="skeleton h-12 w-2/3 max-w-xl" />
    <div className="skeleton h-5 w-1/2 max-w-md" />
    <div className="skeleton mt-6 h-72 !rounded-3xl" />
  </div>
);

const Shell = () => {
  const { isAuthLoading } = useAuth();
  const { pathname } = useLocation();
  // The opening animation is for people who arrive on the home page. Visitors who land
  // straight on a listing, state page or article (usually from a search engine) see the
  // content at once.
  const [playIntro] = useState(() => pathname === "/" && !introAlreadySeen());
  const [minTimePassed, setMinTimePassed] = useState(!playIntro);

  useEffect(() => {
    if (!playIntro) return;
    markIntroSeen();
    const timer = setTimeout(() => setMinTimePassed(true), MIN_PRELOADER_MS);
    return () => clearTimeout(timer);
  }, [playIntro]);

  // The opening screen stays until the animation has played and the session is known
  const showPreloader = playIntro && (!minTimePassed || isAuthLoading);

  return (
    <>
      <ScrollRestoration />
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
      <AnimatePresence>{showPreloader && <Preloader key="preloader" />}</AnimatePresence>
    </>
  );
};

/** Top of the app: session, scroll restoration, the opening screen and the current page. */
const Root = () => (
  <AuthProvider>
    <Shell />
  </AuthProvider>
);

export default Root;
