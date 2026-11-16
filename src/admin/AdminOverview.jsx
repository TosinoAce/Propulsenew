import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Building2, Handshake, Inbox, Plus } from "lucide-react";
import supabase from "../lib/supabase";
import { LISTING_STATUS } from "../lib/constants";
import Button from "../components/button";
import ListingImage from "../components/ListingImage";
import { PartnerLogo } from "../components/PartnerBadge";
import CountUp from "../components/motion/CountUp";
import Spotlight from "../components/motion/Spotlight";
import { useAuth } from "../auth/AuthContext";
import { describeError } from "./errors";
import { ErrorNote } from "./ui";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const STATUS_COLOURS = {
  available: "bg-ink",
  under_offer: "bg-accent",
  sold: "bg-muted",
};

/** Landing screen of the admin area: what needs attention, the catalog at a glance, recent activity. */
const AdminOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [listings, partners, inquiries] = await Promise.all([
        supabase
          .from("properties")
          .select('id, "propertyName", "propertyLocation", "propertyPrice", "propertyImage", "propertyLocationTag", status, is_published, partner_id, created_at')
          .order("id", { ascending: false }),
        supabase.from("partners").select("id, name, logo_url, is_active, verified_at").order("name"),
        supabase
          .from("inquiries")
          .select('id, name, message, created_at, status, realtor_name, property:properties(id, "propertyName")')
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;

      const failed = [listings, partners, inquiries].find((result) => result.error);
      if (failed) {
        console.error("Failed to load overview:", failed.error);
        setError(describeError(failed.error, "We could not load the overview."));
        return;
      }

      setData({ listings: listings.data, partners: partners.data, inquiries: inquiries.data });
    };

    load();
    return () => { active = false; };
  }, []);

  const name = user?.user_metadata?.fullName?.split(" ")[0] || "there";

  if (!data) {
    return (
      <>
        <ErrorNote>{error}</ErrorNote>
        {!error && (
          <div className="flex flex-col gap-4" aria-hidden="true">
            <div className="skeleton h-56 !rounded-3xl" />
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-40 !rounded-3xl" />)}
            </div>
            <div className="skeleton h-72 !rounded-3xl" />
          </div>
        )}
      </>
    );
  }

  const { listings, partners, inquiries } = data;
  const newInquiries = inquiries.filter((inquiry) => inquiry.status === "new");
  const hidden = listings.filter((listing) => !listing.is_published).length;
  const paused = partners.filter((partner) => !partner.is_active).length;

  // Listings per sale status, for the bar
  const byStatus = Object.keys(LISTING_STATUS).map((status) => ({
    status,
    label: LISTING_STATUS[status],
    count: listings.filter((listing) => listing.status === status).length,
  }));

  // Listings per partner, busiest first
  const perPartner = partners
    .map((partner) => ({ partner, count: listings.filter((listing) => listing.partner_id === partner.id).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const busiest = Math.max(1, ...perPartner.map((entry) => entry.count));

  const tiles = [
    { to: "/admin/inquiries", icon: Inbox, value: newInquiries.length, label: newInquiries.length === 1 ? "New inquiry" : "New inquiries", note: `${inquiries.length} in total` },
    { to: "/admin/properties", icon: Building2, value: listings.length, label: listings.length === 1 ? "Listing" : "Listings", note: hidden > 0 ? `${hidden} hidden from the site` : "All published" },
    { to: "/admin/partners", icon: Handshake, value: partners.length, label: partners.length === 1 ? "Partner" : "Partners", note: paused > 0 ? `${paused} paused` : "All active" },
  ];

  return (
    <>
      <ErrorNote>{error}</ErrorNote>

      {/* Welcome panel with the one thing that most needs doing */}
      <Spotlight tone="dark" className="rounded-3xl bg-ink p-6 text-white sm:p-10">
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-white/60">{greeting()}, {name}</p>
            <h1 className="mt-2 max-w-xl text-3xl font-semibold leading-tight tracking-tighter sm:text-4xl">
              {newInquiries.length > 0
                ? `${newInquiries.length} ${newInquiries.length === 1 ? "inquiry is" : "inquiries are"} waiting to be passed to a partner.`
                : "Every inquiry has been handled. Nothing is waiting."}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {newInquiries.length > 0 && (
              <Button to="/admin/inquiries" variant="accent">
                Open inbox
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </Button>
            )}
            <Button to="/admin/properties?new=1" variant="secondary" className="!border-white/25 !bg-transparent !text-white hover:!border-white">
              <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
              Add property
            </Button>
          </div>
        </div>
      </Spotlight>

      {/* Headline figures */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className="group flex flex-col rounded-3xl border border-line bg-panel p-6 transition duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
                <tile.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <ArrowUpRight className="size-5 text-muted transition-transform duration-300 group-hover:rotate-45 group-hover:text-ink" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <p className="mt-6 text-5xl font-semibold tracking-tighter text-ink"><CountUp value={tile.value} /></p>
            <p className="mt-1 font-medium text-ink">{tile.label}</p>
            <p className="mt-0.5 text-sm text-muted">{tile.note}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        {/* Latest inquiries */}
        <section className="rounded-3xl border border-line bg-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-ink">Latest inquiries</h2>
            <Button to="/admin/inquiries" variant="ghost" size="sm">See all</Button>
          </div>
          {inquiries.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-tint px-5 py-6 text-muted">No inquiries have come in yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col">
              {inquiries.slice(0, 6).map((inquiry) => (
                <li key={inquiry.id} className="flex items-start gap-3 border-t border-line py-3.5 first:border-t-0">
                  <span
                    className={`mt-2 size-2 shrink-0 rounded-full ${inquiry.status === "new" ? "bg-accent" : "bg-line"}`}
                    aria-label={inquiry.status === "new" ? "New" : undefined}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">
                      <span className="font-semibold">{inquiry.name}</span>
                      <span className="text-muted">{inquiry.property ? ` about ${inquiry.property.propertyName}` : ", general message"}</span>
                    </p>
                    <p className="truncate text-sm text-muted">{inquiry.message}</p>
                  </div>
                  <p className="shrink-0 text-sm text-muted">
                    {new Date(inquiry.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* The catalog at a glance */}
        <section className="flex flex-col gap-4">
          <div className="rounded-3xl border border-line bg-panel p-6">
            <h2 className="text-xl font-semibold tracking-tight text-ink">Listings by status</h2>
            <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-tint" aria-hidden="true">
              {byStatus.map((entry) =>
                entry.count > 0 ? (
                  <span key={entry.status} className={STATUS_COLOURS[entry.status]} style={{ width: `${(entry.count / listings.length) * 100}%` }} />
                ) : null
              )}
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3">
              {byStatus.map((entry) => (
                <div key={entry.status}>
                  <dt className="flex items-center gap-2 text-sm text-muted">
                    <span className={`size-2.5 rounded-full ${STATUS_COLOURS[entry.status]}`} aria-hidden="true" />
                    {entry.label}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight text-ink">{entry.count}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-3xl border border-line bg-panel p-6">
            <h2 className="text-xl font-semibold tracking-tight text-ink">Listings per partner</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {perPartner.map(({ partner, count }) => (
                <li key={partner.id} className="flex items-center gap-3">
                  <PartnerLogo partner={partner} className="size-8 !rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="truncate font-medium text-ink">{partner.name}</span>
                      <span className="shrink-0 text-muted">{count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-tint" aria-hidden="true">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(count / busiest) * 100}%` }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Most recently added listings */}
      <section className="mt-4 rounded-3xl border border-line bg-panel p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-ink">Recently added</h2>
          <Button to="/admin/properties" variant="ghost" size="sm">All properties</Button>
        </div>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {listings.slice(0, 4).map((listing) => (
            <li key={listing.id}>
              <Link to={`/property/${listing.id}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-tint">
                  <ListingImage src={listing.propertyImage} loading="lazy" sizes="(min-width: 1024px) 20vw, 50vw" className="transition-transform duration-700 ease-out-expo group-hover:scale-105" />
                  {!listing.is_published && (
                    <span className="absolute left-2 top-2 rounded-full bg-panel px-2.5 py-0.5 text-xs text-muted">Hidden</span>
                  )}
                </div>
                <p className="mt-2 truncate font-medium text-ink">{listing.propertyName}</p>
                <p className="truncate text-sm text-muted">₦{listing.propertyPrice}, {listing.propertyLocation}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default AdminOverview;
