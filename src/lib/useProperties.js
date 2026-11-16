import { useEffect, useState } from "react";
import supabase from "./supabase";
import { useAuth } from "../auth/AuthContext";

/** Columns every listing view needs, including the partner the listing belongs to. */
export const LISTING_SELECT = "*, partner:partners(id, name, slug, logo_url, verified_at)";

// One shared copy of the catalog, so the navbar, footer and page do not each fetch it.
// It is refetched when the session changes or after an admin edits something.
let cache = { key: null, properties: null, promise: null };
const listeners = new Set();

const load = (key) => {
  if (cache.key === key && cache.promise) return cache.promise;

  const promise = supabase
    .from("properties")
    .select(LISTING_SELECT)
    .order("id", { ascending: false })
    .then(({ data, error }) => {
      if (error) throw error;
      if (cache.promise === promise) cache.properties = data;
      return data;
    });

  cache = { key, properties: cache.key === key ? cache.properties : null, promise };
  return promise;
};

/** Forget the cached catalog and make every mounted listing view reload. */
export const invalidateProperties = () => {
  cache = { key: null, properties: null, promise: null };
  listeners.forEach((notify) => notify());
};

/** Loads every listing visitors may see, newest first. */
export const useProperties = () => {
  const { user, isAuthLoading } = useAuth();
  const key = user?.id ?? "anon";
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({
    properties: cache.key === key && cache.properties ? cache.properties : [],
    loading: !(cache.key === key && cache.properties),
    error: false,
  });

  useEffect(() => {
    const notify = () => setVersion((value) => value + 1);
    listeners.add(notify);
    return () => listeners.delete(notify);
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    let active = true;
    if (!(cache.key === key && cache.properties)) {
      setState((prev) => ({ ...prev, loading: true, error: false }));
    }

    load(key)
      .then((properties) => {
        if (active) setState({ properties, loading: false, error: false });
      })
      .catch((error) => {
        console.error("Error fetching properties:", error);
        // Let the next mount try again instead of replaying the failure
        cache = { key: null, properties: null, promise: null };
        if (active) setState({ properties: [], loading: false, error: true });
      });

    return () => {
      active = false;
    };
  }, [isAuthLoading, key, version]);

  return { ...state, loading: state.loading || isAuthLoading };
};

/** The states that currently have listings, busiest first. */
export const getListingStates = (properties) => {
  const counts = new Map();
  for (const property of properties) {
    const state = property.propertyLocationTag;
    if (state) counts.set(state, (counts.get(state) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([state]) => state);
};
