import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import { getRedirectTarget } from "../lib/redirect";

export const defaultProvider = {
  user: null,
  setUser: () => null,
  isAuthLoading: false,
  handleLogout: () => { },
};

export const AuthContext = createContext(defaultProvider);

const AUTH_PAGES = ["/login", "/signup"];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error("Session error:", error);
        setUser(data?.session?.user ?? null);
      })
      .catch((error) => {
        console.error("Auth error:", error);
      })
      .finally(() => {
        if (active) setIsAuthLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      // Logged-in users have no business on the login / signup pages
      if (event === "SIGNED_IN" && AUTH_PAGES.includes(window.location.pathname)) {
        navigate(getRedirectTarget(), { replace: true });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout failed:", error);
    navigate("/");
  };

  const value = {
    user,
    setUser,
    isAuthLoading,
    handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
