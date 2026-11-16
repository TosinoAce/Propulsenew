import { Link } from "react-router-dom";
import { ArrowUpRight, BadgeCheck, MapPin } from "lucide-react";
import { PartnerLogo } from "./PartnerBadge";
import Tilt from "./motion/Tilt";

const PartnerCard = ({ partner, listingCount, hidden = false }) => (
  <li aria-hidden={hidden || undefined} className="w-[19rem] shrink-0 sm:w-[21rem]">
    <Tilt max={5} className="h-full">
      <Link
        to={`/partners/${partner.slug}`}
        tabIndex={hidden ? -1 : undefined}
        className="group flex h-full flex-col rounded-3xl border border-line bg-panel p-6 shadow-card transition-shadow duration-500 hover:shadow-lift"
      >
        <div className="flex items-start justify-between gap-4">
          <PartnerLogo partner={partner} className="size-16 !rounded-2xl" />
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors duration-500 ease-out-expo group-hover:border-ink group-hover:bg-ink group-hover:text-white">
            <ArrowUpRight
              className="size-5 transition-transform duration-500 ease-out-expo group-hover:rotate-45"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </span>
        </div>

        <h3 className="mt-6 text-2xl font-semibold tracking-tight text-ink">{partner.name}</h3>
        {partner.verified_at && (
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-accent-deep">
            <BadgeCheck className="size-4" strokeWidth={2} aria-hidden="true" />
            Verified partner
          </p>
        )}
        {partner.description && (
          <p className="mt-3 line-clamp-3 leading-relaxed text-muted">{partner.description}</p>
        )}

        <div className="mt-auto pt-5">
        <div className="flex items-center justify-between gap-3 border-t border-line pt-4 text-sm text-muted">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="truncate">{partner.states?.join(", ") || "Nigeria"}</span>
          </span>
          <span className="shrink-0 font-medium text-ink">
            {listingCount} {listingCount === 1 ? "listing" : "listings"}
          </span>
        </div>
        </div>
      </Link>
    </Tilt>
  </li>
);

/**
 * The live partner list as a row of cards that glides sideways and pauses under the cursor
 * or keyboard focus. Each card leans toward the pointer and opens the partner's page.
 * People who prefer reduced motion get a row they scroll by hand.
 */
const PartnerCarousel = ({ partners, listingCounts = {} }) => (
  <div className="[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
    <ul className="flex w-max animate-marquee gap-5 py-4 pr-5 [animation-duration:55s] hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
      {partners.map((partner) => (
        <PartnerCard key={partner.id} partner={partner} listingCount={listingCounts[partner.id] ?? 0} />
      ))}
      {partners.map((partner) => (
        <PartnerCard key={`${partner.id}-copy`} partner={partner} listingCount={listingCounts[partner.id] ?? 0} hidden />
      ))}
    </ul>
  </div>
);

export default PartnerCarousel;
