import { useEffect, useState } from "react";
import supabase from "./supabase";
import { useAuth } from "../auth/AuthContext";

export const LOCATIONS = ["Kwara State", "Lagos State"];
export const PROPERTY_TYPES = ["Land", "House"];

/**
 * Loads every listing, newest first. Re-runs when the session changes so
 * listings appear straight after signing in.
 */
export const useProperties = () => {
  const { user, isAuthLoading } = useAuth();
  const [state, setState] = useState({ properties: [], loading: true, error: false });

  useEffect(() => {
    if (isAuthLoading) return;

    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: false }));

    supabase
      .from("properties")
      .select("*")
      .order("id", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Error fetching properties:", error);
          setState({ properties: [], loading: false, error: true });
        } else {
          setState({ properties: data, loading: false, error: false });
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthLoading, user?.id]);

  return { ...state, loading: state.loading || isAuthLoading, isSignedIn: Boolean(user) };
};
