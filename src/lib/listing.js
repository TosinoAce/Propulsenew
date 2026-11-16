import supabase from "./supabase";
import { LISTING_SELECT } from "./useProperties";

// Requests for single listings, shared between the router (which starts the request while
// the page's code is still downloading) and the property page (which uses the result).
const requests = new Map();

/** Starts loading one listing with its photos and partner, or returns the request already running. */
export const fetchListing = (id) => {
  const key = Number(id);
  if (!Number.isInteger(key)) return Promise.resolve({ data: null, error: null });

  if (!requests.has(key)) {
    const request = supabase
      .from("properties")
      .select(`${LISTING_SELECT}, images:property_images(id, url, position)`)
      .eq("id", key)
      .maybeSingle()
      .then((result) => {
        // Keep a successful result only briefly, so returning to the page shows fresh data
        setTimeout(() => requests.delete(key), 30000);
        if (result.error) requests.delete(key);
        return result;
      });
    requests.set(key, request);
  }

  return requests.get(key);
};
