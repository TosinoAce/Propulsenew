import { useEffect, useState } from "react";
import supabase from "./supabase";

/** Loads the active partners visitors may see, in name order. */
export const usePartners = () => {
  const [state, setState] = useState({ partners: [], loading: true, error: false });

  useEffect(() => {
    let active = true;

    supabase
      .from("partners")
      .select("id, name, slug, logo_url, description, states, verified_at")
      .eq("is_active", true)
      .order("name")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Error fetching partners:", error);
          setState({ partners: [], loading: false, error: true });
        } else {
          setState({ partners: data, loading: false, error: false });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
};
