import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, Ruler, X } from "lucide-react";
import ListingImage from "./ListingImage";
import PartnerBadge from "./PartnerBadge";
import Tilt from "./motion/Tilt";
import { LISTING_STATUS } from "../lib/constants";
import { SIZES } from "../lib/images";

/** Label for listings that are no longer simply available. Renders nothing for available ones. */
export const StatusLabel = ({ status, className = "" }) => {
  if (!status || status === "available") return null;

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        status === "sold" ? "bg-ink text-white" : "bg-accent text-ink"
      } ${className}`}
    >
      {LISTING_STATUS[status] ?? status}
    </span>
  );
};

/**
 * Listing card used on the home page, the properties page, saved properties, partner pages
 * and "similar properties". The whole card leans toward the cursor and is one link.
 * `feature` makes the photo taller for a lead card.
 */
const PropertyCard = ({ property, feature = false, onRemove }) => {
  const {
    id, propertyImage, propertyName, propertyLocation, propertyPrice,
    propertyDetails, propertyTypeTag, partner, status,
  } = property;

  return (
    <Tilt max={4} className="h-full">
      <article className="group relative flex h-full flex-col rounded-3xl border border-line bg-panel p-2.5 shadow-card transition-shadow duration-500 hover:shadow-lift">
        <Link
          to={`/property/${id}`}
          className="flex h-full flex-col rounded-2xl focus-visible:outline-offset-4"
          aria-label={`${propertyName}, ${propertyLocation}, ${propertyPrice} naira`}
        >
          <div
            className={`relative overflow-hidden rounded-2xl bg-tint ${
              feature ? "aspect-[4/3] lg:aspect-auto lg:min-h-64 lg:flex-1" : "aspect-[4/3]"
            }`}
          >
            <ListingImage
              src={propertyImage}
              sizes={feature ? SIZES.half : SIZES.third}
              loading="lazy"
              className={`transition-transform duration-700 ease-out-expo group-hover:scale-[1.06] ${
                status === "sold" ? "grayscale" : ""
              }`}
            />
            <StatusLabel status={status} className="absolute left-3 top-3 shadow-card" />
          </div>

          <div className={`flex flex-col px-3 pb-2 pt-4 ${feature ? "" : "flex-1"}`}>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {propertyTypeTag && (
                <span className="rounded-full bg-accent-soft px-3 py-1 font-medium text-accent-deep">
                  {propertyTypeTag}
                </span>
              )}
              {propertyDetails && (
                <span className="flex items-center gap-1.5 text-muted">
                  <Ruler className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  {propertyDetails}
                </span>
              )}
            </div>

            <h3 className={`mt-3 font-semibold tracking-tight text-ink ${feature ? "text-3xl" : "text-xl"}`}>
              {propertyName}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-muted">
              <MapPin className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              {propertyLocation}
            </p>

            {partner && <div className="mt-3"><PartnerBadge partner={partner} /></div>}

            {/* The price row sits on the card's bottom edge so cards in a row line up */}
            <div className="mt-auto pt-4">
            <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
              <p className={`font-semibold tracking-tight text-ink ${feature ? "text-3xl" : "text-2xl"}`}>
                <span className="text-accent-deep">₦</span>
                {propertyPrice}
              </p>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors duration-500 ease-out-expo group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                <ArrowUpRight
                  className="size-5 transition-transform duration-500 ease-out-expo group-hover:rotate-45"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </span>
            </div>
            </div>
          </div>
        </Link>

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${propertyName} from saved properties`}
            className="absolute right-5 top-5 z-10 flex size-9 items-center justify-center rounded-full bg-panel text-ink shadow-card transition duration-300 ease-out-expo hover:bg-ink hover:text-white active:scale-95"
          >
            <X className="size-4" strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </article>
    </Tilt>
  );
};

/** Placeholder with the same footprint as a PropertyCard, shown while listings load. */
export const PropertyCardSkeleton = () => (
  <div aria-hidden="true" className="rounded-3xl border border-line bg-panel p-2.5">
    <div className="skeleton aspect-[4/3] !rounded-2xl" />
    <div className="flex flex-col gap-3 px-3 pb-2 pt-4">
      <div className="skeleton h-6 w-1/3 !rounded-full" />
      <div className="skeleton h-6 w-2/3" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton mt-3 h-8 w-2/5" />
    </div>
  </div>
);

export default PropertyCard;
