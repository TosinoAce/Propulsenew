import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Propulse";
const DEFAULT_TITLE = "Propulse | Land and houses for sale in Nigeria from verified partners";
const DEFAULT_DESCRIPTION =
  "Browse land and houses for sale across Nigeria, from Lagos and Abuja to Kwara and Rivers. Every listing comes from a verified partner you can contact directly.";
const DEFAULT_IMAGE = "/og-image.jpg";

/** Absolute address for a path on this site. */
export const absoluteUrl = (path = "/") =>
  /^https?:\/\//i.test(path) ? path : `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;

// Creates or updates one <meta> or <link> tag in the document head
const setTag = (tag, keyAttribute, key, valueAttribute, value) => {
  let element = document.head.querySelector(`${tag}[${keyAttribute}="${key}"]`);
  if (value == null || value === "") {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement(tag);
    element.setAttribute(keyAttribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute(valueAttribute, value);
};

/**
 * Sets the page title, description, canonical address, social sharing tags and
 * structured data (JSON-LD) for the current page. Render it once per page.
 *
 * - `title`: page name; " | Propulse" is added. Leave empty on the home page.
 * - `image`: sharing image, a site path or a full address.
 * - `noindex`: keeps private pages (sign in, admin, saved) out of search results.
 * - `jsonLd`: one structured-data object, or a list of them.
 */
const Seo = ({ title, description, image, type = "website", noindex = false, jsonLd }) => {
  const { pathname } = useLocation();
  const structured = jsonLd ? JSON.stringify(Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : jsonLd) : "";

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const text = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, " ").trim().slice(0, 300);
    const url = absoluteUrl(pathname);
    const picture = absoluteUrl(image || DEFAULT_IMAGE);

    document.title = fullTitle;
    setTag("meta", "name", "description", "content", text);
    setTag("meta", "name", "robots", "content", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    setTag("link", "rel", "canonical", "href", noindex ? null : url);

    setTag("meta", "property", "og:title", "content", fullTitle);
    setTag("meta", "property", "og:description", "content", text);
    setTag("meta", "property", "og:url", "content", url);
    setTag("meta", "property", "og:type", "content", type);
    setTag("meta", "property", "og:image", "content", picture);
    setTag("meta", "name", "twitter:title", "content", fullTitle);
    setTag("meta", "name", "twitter:description", "content", text);
    setTag("meta", "name", "twitter:image", "content", picture);

    let script = document.getElementById("page-jsonld");
    if (!structured) {
      script?.remove();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "page-jsonld";
        document.head.appendChild(script);
      }
      script.textContent = structured;
    }
  }, [title, description, image, type, noindex, structured, pathname]);

  return null;
};

/** Structured data for a trail of pages, for example Home > Properties > Lagos State. */
export const breadcrumbs = (trail) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((step, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: step.name,
    item: absoluteUrl(step.path),
  })),
});

export default Seo;
