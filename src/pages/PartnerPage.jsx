import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, BadgeCheck, Building2, MapPin, SearchX } from "lucide-react";
import supabase from "../lib/supabase";
import { LISTING_SELECT } from "../lib/useProperties";
import { stateSlug } from "../lib/constants";
import MainLayout from "../layout/MainLayout";
import Seo, { absoluteUrl, breadcrumbs } from "../components/Seo";
import Button from "../components/button";
import EmptyState from "../components/EmptyState";
import { PartnerLogo } from "../components/PartnerBadge";
import PropertyCard, { PropertyCardSkeleton } from "../components/PropertyCard";
import Reveal from "../components/Reveal";

const EASE = [0.16, 1, 0.3, 1];

const formatMonth = (date) =>
  new Date(date).toLocaleDateString("en-NG", { month: "long", year: "numeric" });

/** Public profile of one verified partner with everything they have listed. */
const PartnerPage = () => {
  const { slug } = useParams();
  const [partner, setPartner] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    const load = async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("id, name, slug, logo_url, description, states, verified_at")
        .eq("slug", slug)
        .maybeSingle();

      if (!active) return;
      if (error) {
        console.error("Failed to load partner:", error);
        setError(true);
        setLoading(false);
        return;
      }

      setPartner(data);
      if (data) {
        const { data: rows } = await supabase
          .from("properties")
          .select(LISTING_SELECT)
          .eq("partner_id", data.id)
          .order("id", { ascending: false });
        if (active && rows) setListings(rows);
      }
      if (active) setLoading(false);
    };

    load();
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return (
      <MainLayout>
        <div className="shell min-h-[100dvh] pt-32" aria-hidden="true">
          <div className="skeleton size-20 !rounded-2xl" />
          <div className="skeleton mt-6 h-12 w-2/3 max-w-lg" />
          <div className="skeleton mt-4 h-5 w-full max-w-xl" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !partner) {
    return (
      <MainLayout>
        <div className="shell pt-28">
          <EmptyState
            icon={SearchX}
            title={error ? "Something went wrong" : "Partner not found"}
            text={error ? "We could not load this partner. Please try again." : "This partner may no longer be listed on Propulse."}
          >
            <Button to="/property">Browse properties</Button>
          </EmptyState>
        </div>
      </MainLayout>
    );
  }

  const available = listings.filter((listing) => listing.status !== "sold").length;

  return (
    <MainLayout>
      <Seo
        title={`${partner.name}, verified Propulse partner`}
        description={partner.description || `Properties for sale from ${partner.name}, a verified Propulse partner in Nigeria.`}
        image={partner.logo_url || undefined}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            name: partner.name,
            description: partner.description ?? undefined,
            logo: partner.logo_url ? absoluteUrl(partner.logo_url) : undefined,
            url: absoluteUrl(`/partners/${partner.slug}`),
            areaServed: (partner.states ?? []).map((state) => ({ "@type": "State", name: state, containedInPlace: { "@type": "Country", name: "Nigeria" } })),
          },
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
            { name: partner.name, path: `/partners/${partner.slug}` },
          ]),
        ]}
      />
      <motion.header
        className="shell pt-28"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <Link to="/property" className="inline-flex items-center gap-2 text-muted transition-colors duration-300 hover:text-ink">
          <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
          All properties
        </Link>

        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
          <PartnerLogo partner={partner} className="size-24 !rounded-3xl" />
          <div>
            <h1 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">{partner.name}</h1>
            {partner.verified_at && (
              <p className="mt-2 flex items-center gap-1.5 font-medium text-accent-deep">
                <BadgeCheck className="size-5" strokeWidth={2} aria-hidden="true" />
                Verified partner since {formatMonth(partner.verified_at)}
              </p>
            )}
          </div>
        </div>

        {partner.description && (
          <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-muted">{partner.description}</p>
        )}

        <dl className="mt-8 flex flex-wrap gap-3">
          <div className="rounded-2xl bg-tint px-5 py-4">
            <dt className="text-sm text-muted">Listings available</dt>
            <dd className="mt-1 text-lg font-semibold text-ink">{available}</dd>
          </div>
          {partner.states?.length > 0 && (
            <div className="rounded-2xl bg-tint px-5 py-4">
              <dt className="flex items-center gap-1.5 text-sm text-muted">
                <MapPin className="size-4" strokeWidth={1.75} aria-hidden="true" />
                Operates in
              </dt>
              <dd className="mt-1 flex flex-wrap gap-x-3 text-lg font-semibold text-ink">
                {partner.states.map((state) => (
                  <Link key={state} to={`/property/in/${stateSlug(state)}`} className="underline-offset-4 hover:underline">
                    {state}
                  </Link>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </motion.header>

      <section className="shell pt-16">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tighter text-ink sm:text-4xl">
            Listings from {partner.name}
          </h2>
        </Reveal>

        {listings.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No listings right now"
            text="This partner has nothing on the market at the moment. Please check back soon."
          />
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing, index) => (
              <Reveal key={listing.id} delay={(index % 3) * 0.06}>
                <PropertyCard property={listing} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
};

export default PartnerPage;
