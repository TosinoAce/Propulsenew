/** Turns a database or storage error into a sentence an admin can act on. */
export const describeError = (error, fallback) => {
  if (error?.code === "23505") return "Something with that name already exists. Please choose a different name.";
  if (error?.code === "23503") return "This is still linked to other records, so it cannot be removed.";
  if (error?.code === "42501") return "Your account is not allowed to do that.";
  return error?.message ? `${fallback} (${error.message})` : fallback;
};
