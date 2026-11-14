/**
 * Sign-in return path. Pages that need an account send the visitor to
 * /login?redirect=<where they were>, and sign-in brings them straight back.
 */

/** Link to the sign-in (or sign-up) page that returns to `path` afterwards. */
export const authLink = (path, page = "/login") =>
  `${page}?redirect=${encodeURIComponent(path)}`;

/** The page to open after signing in. Only same-site paths are accepted. */
export const getRedirectTarget = (search = window.location.search) => {
  const target = new URLSearchParams(search).get("redirect");
  const isLocalPath = target && target.startsWith("/") && !target.startsWith("//");
  return isLocalPath ? target : "/";
};
