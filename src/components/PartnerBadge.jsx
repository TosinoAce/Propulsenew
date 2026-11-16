import { BadgeCheck } from "lucide-react";
import { getInitials } from "../lib/constants";

/** A partner's logo, or their initials when no logo has been uploaded. */
export const PartnerLogo = ({ partner, className = "size-10" }) =>
  partner.logo_url ? (
    <img
      src={partner.logo_url}
      alt=""
      className={`${className} shrink-0 rounded-xl border border-line bg-panel object-cover`}
    />
  ) : (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-xl bg-ink text-sm font-semibold text-accent`}>
      {getInitials(partner.name)}
    </span>
  );

/** Small "who listed this" line with the verified mark. Used on listing cards. */
const PartnerBadge = ({ partner }) => (
  <p className="flex min-w-0 items-center gap-2 text-sm text-muted">
    <PartnerLogo partner={partner} className="size-6 !rounded-md" />
    <span className="truncate">{partner.name}</span>
    {partner.verified_at && (
      <BadgeCheck className="size-4 shrink-0 text-accent-deep" strokeWidth={2} aria-label="Verified partner" />
    )}
  </p>
);

export default PartnerBadge;
