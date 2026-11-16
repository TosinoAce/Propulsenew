/** Every state a listing or partner can be placed in. Stored exactly as written here. */
export const NIGERIAN_STATES = [
  "Abia State", "Abuja (FCT)", "Adamawa State", "Akwa Ibom State", "Anambra State", "Bauchi State",
  "Bayelsa State", "Benue State", "Borno State", "Cross River State", "Delta State", "Ebonyi State",
  "Edo State", "Ekiti State", "Enugu State", "Gombe State", "Imo State", "Jigawa State",
  "Kaduna State", "Kano State", "Katsina State", "Kebbi State", "Kogi State", "Kwara State",
  "Lagos State", "Nasarawa State", "Niger State", "Ogun State", "Ondo State", "Osun State",
  "Oyo State", "Plateau State", "Rivers State", "Sokoto State", "Taraba State", "Yobe State",
  "Zamfara State",
];

export const PROPERTY_TYPES = ["Land", "House"];

export const TITLE_DOCUMENTS = [
  "Certificate of Occupancy",
  "Governor's Consent",
  "Deed of Assignment",
  "Registered Survey",
  "Gazette",
  "Excision",
];

/** Sale status of a listing: stored value -> label shown to people. */
export const LISTING_STATUS = {
  available: "Available",
  under_offer: "Under offer",
  sold: "Sold",
};

/** Where an inquiry is in the team's follow-up: stored value -> label. */
export const INQUIRY_STATUS = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

/** 4500000 -> "4,500,000" (the naira sign is added where the price is shown). */
export const formatAmount = (value) => Number(value || 0).toLocaleString("en-NG");

/** "Crestpoint Homes" -> "crestpoint-homes", for partner page addresses. */
export const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Up to two initials from a name, for avatars without a picture. */
export const getInitials = (name) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "P";

export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

/** Where a job application is in review: stored value -> label. */
export const APPLICATION_STATUS = {
  new: "New",
  reviewing: "Reviewing",
  interview: "Interview",
  closed: "Closed",
};

/** "2026-11-12T..." -> "12 November 2026". Empty when there is no date. */
export const formatPostDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "";

/** "Lagos State" -> "lagos-state", "Abuja (FCT)" -> "abuja-fct". Used in state page addresses. */
export const stateSlug = (state) => slugify(state);

/** "lagos-state" -> "Lagos State". Undefined when the address does not match a state. */
export const stateFromSlug = (slug) => NIGERIAN_STATES.find((state) => stateSlug(state) === slug);

/** "Lagos State" -> "Lagos", "Abuja (FCT)" -> "Abuja". For headings like "Property in Lagos". */
export const shortStateName = (state) => state.replace(/\s*\(FCT\)$/, "").replace(/ State$/, "");
