import { useEffect, useState } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { AuthProvider, useAuth } from "../auth/AuthContext";
import Preloader from "../components/Preloader";

// Long enough for the opening animation to finish drawing
const MIN_PRELOADER_MS = 2000;

const Shell = () => {
  const { isAuthLoading } = useAuth();
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), MIN_PRELOADER_MS);
    return () => clearTimeout(timer);
  }, []);

  // The opening screen stays until the animation has played and the session is known
  const showPreloader = !minTimePassed || isAuthLoading;

  return (
    <>
      <ScrollRestoration />
      <Outlet />
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
