import { useId } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Building2, ChevronLeft, ChevronRight, Search, SearchX, X } from "lucide-react";
import MainLayout from "../layout/MainLayout";
import Button from "../components/button";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import PropertyCard, { PropertyCardSkeleton } from "../components/PropertyCard";
import Reveal from "../components/Reveal";
import { LOCATIONS, PROPERTY_TYPES, useProperties } from "../lib/useProperties";

const ITEMS_PER_PAGE = 9;
const ONE_MILLION = 1000000;
const EASE = [0.16, 1, 0.3, 1];

const SORTS = {
  newest: { label: "Newest first", compare: (a, b) => b.id - a.id },
  "price-asc": { label: "Price: low to high", compare: (a, b) => Number(a.propertyPriceTag) - Number(b.propertyPriceTag) },
  "price-desc": { label: "Price: high to low", compare: (a, b) => Number(b.propertyPriceTag) - Number(a.propertyPriceTag) },
};

/** Row of options where a highlight slides to the chosen one. */
const Segmented = ({ label, options, value, onChange }) => {
  const groupId = useId();

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1 rounded-full bg-tint p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`relative rounded-full px-4 py-2 text-[15px] transition-colors duration-300 ${
              active ? "text-white" : "text-muted hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`segment-${groupId}`}
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const PropertyPage = () => {
  const { properties, loading, error } = useProperties();

  // Filters live in the URL so a search can be shared, bookmarked and stepped back through
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const location = searchParams.get("location") ?? "";
  const type = searchParams.get("type") ?? "";
  const price = searchParams.get("price") ?? "";
  const sort = SORTS[searchParams.get("sort")] ? searchParams.get("sort") : "newest";
  const requestedPage = Number(searchParams.get("page")) || 1;

  const updateParam = (key, value) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        // Any filter change starts again from the first page
        if (key !== "page") next.delete("page");
        return next;
      },
      { replace: key !== "page" }
    );
  };

  const clearFilters = () => setSearchParams({}, { replace: true });

  const hasFilters = Boolean(search || location || type || price);
  const searchTerm = search.trim().toLowerCase();

  const filtered = properties
    .filter((property) => {
      const amount = Number(property.propertyPriceTag);

      if (price === "below" && !(amount < ONE_MILLION)) return false;
      if (price === "above" && !(amount >= ONE_MILLION)) return false;
      if (location && property.propertyLocationTag !== location) return false;
      if (type && property.propertyTypeTag !== type) return false;
      if (
        searchTerm &&
        !`${property.propertyName} ${property.propertyLocation}`.toLowerCase().includes(searchTerm)
      ) return false;

      return true;
    })
    .sort(SORTS[sort].compare);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  const visible = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const goToPage = (next) => {
    updateParam("page", next > 1 ? String(next) : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      );
    }

    if (error) {
      return (
        <EmptyState
          icon={Building2}
          title="We could not load the properties"
          text="Please check your connection and try again."
        >
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </EmptyState>
      );
    }

    if (properties.length === 0) {
      return (
        <EmptyState
          icon={Building2}
          title="No properties listed yet"
          text="New listings are on the way. Please check back soon."
        />
      );
    }

    if (visible.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title="No properties match your search"
          text="Try a different location, type or budget, or clear the filters to see everything."
        >
          <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>
        </EmptyState>
      );
    }

    // Cards slide to their new places when a filter or the sort order changes
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((property) => (
            <motion.div
              key={property.id}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <MainLayout>
      <PageHeader
        title="Available properties"
        text="Land and houses across Kwara and Lagos State. Search by name, pick a state and type, and sort by price."
      />

      <section className="shell">
        <Reveal className="rounded-3xl border border-line bg-panel p-4 shadow-card sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <label className="relative block">
              <span className="sr-only">Search properties</span>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <input
                type="search"
                className="field-input !min-h-12 !rounded-full !pl-12"
                placeholder="Search by name or location"
                value={search}
                onChange={(e) => updateParam("q", e.target.value)}
              />
            </label>
            <select
              className="field-input !min-h-12 !rounded-full !px-5"
              aria-label="Budget"
              value={price}
              onChange={(e) => updateParam("price", e.target.value)}
            >
              <option value="">Any budget</option>
              <option value="below">Below ₦1 million</option>
              <option value="above">₦1 million and above</option>
            </select>
            <select
              className="field-input !min-h-12 !rounded-full !px-5"
              aria-label="Sort by"
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value === "newest" ? "" : e.target.value)}
            >
              {Object.entries(SORTS).map(([key, option]) => (
                <option key={key} value={key}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <Segmented
              label="State"
              value={location}
              onChange={(value) => updateParam("location", value)}
              options={[{ value: "", label: "All states" }, ...LOCATIONS.map((entry) => ({ value: entry, label: entry }))]}
            />
            <Segmented
              label="Property type"
              value={type}
              onChange={(value) => updateParam("type", value)}
              options={[{ value: "", label: "All types" }, ...PROPERTY_TYPES.map((entry) => ({ value: entry, label: entry }))]}
            />
          </div>
        </Reveal>

        <div className="flex min-h-11 flex-wrap items-center justify-between gap-3 py-6">
          <p className="text-lg text-muted" aria-live="polite">
            {loading ? (
              "Loading properties"
            ) : properties.length === 0 ? (
              ""
            ) : (
              <>
                <span className="font-semibold text-ink">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "property" : "properties"} {hasFilters ? "found" : "available"}
              </>
            )}
          </p>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="size-4" strokeWidth={2} aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </div>

        {renderResults()}

        {!loading && totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-16 flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="!w-9 !px-0"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="size-4" strokeWidth={2} aria-hidden="true" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <Button
                key={number}
                variant={number === page ? "primary" : "secondary"}
                size="sm"
                className="!w-9 !px-0"
                aria-label={`Page ${number}`}
                aria-current={number === page ? "page" : undefined}
                onClick={() => goToPage(number)}
              >
                {number}
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              className="!w-9 !px-0"
              aria-label="Next page"
              disabled={page === totalPages}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </Button>
          </nav>
        )}
      </section>
    </MainLayout>
  );
};

export default PropertyPage;
