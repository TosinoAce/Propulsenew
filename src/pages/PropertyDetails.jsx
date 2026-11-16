import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft, BadgeCheck, Check, Heart, Link2, Lock, MapPin, MessageCircle, Phone, SearchX, Send, Share2,
} from "lucide-react";
import supabase from "../lib/supabase";
import { toWhatsAppNumber } from "../lib/inquiries";
import { authLink } from "../lib/redirect";
import { LISTING_SELECT } from "../lib/useProperties";
import { fetchListing } from "../lib/listing";
import MainLayout from "../layout/MainLayout";
import Seo, { absoluteUrl, breadcrumbs } from "../components/Seo";
import { shortStateName, stateSlug } from "../lib/constants";
import Button from "../components/button";
import EmptyState from "../components/EmptyState";
import InquiryModal from "../components/InquiryModal";
import { PartnerLogo } from "../components/PartnerBadge";
import PhotoGallery from "../components/PhotoGallery";
import PropertyCard, { StatusLabel } from "../components/PropertyCard";
import Reveal from "../components/Reveal";
import Magnetic from "../components/motion/Magnetic";
import Spotlight from "../components/motion/Spotlight";
import { useAuth } from "../auth/AuthContext";

const EASE = [0.16, 1, 0.3, 1];

const DetailsSkeleton = () => (
  <div className="shell min-h-[100dvh] pb-10 pt-28" aria-hidden="true">
    <div className="skeleton h-5 w-32" />
    <div className="skeleton mt-6 h-12 w-2/3 max-w-xl" />
    <div className="skeleton mt-4 h-5 w-48" />
    <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <div className="skeleton aspect-[16/10] !rounded-3xl" />
      <div className="skeleton h-80 !rounded-3xl" />
    </div>
  </div>
);

const PropertyDetails = () => {
  const { id } = useParams();
  const { user, isAuthLoading } = useAuth();
  const propertyId = Number(id);
  const navigate = useNavigate();
  const signInLink = authLink(`/property/${id}`);

  const [property, setProperty] = useState(null);
  const [contact, setContact] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSaved, setIsSaved] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [shareNote, setShareNote] = useState("");

  const [showForm, setShowForm] = useState(false);
  const closeForm = useCallback(() => setShowForm(false), []);

  // Load the property, its photos and partner. Re-runs when the session changes,
  // because the partner's contact details are only readable once signed in.
  useEffect(() => {
    if (!Number.isInteger(propertyId)) {
      setError("This property link is not valid.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    setSimilar([]);
    setContact(null);

    const load = async () => {
      // Usually already under way: the router starts it while this page's code downloads
      const { data, error } = await fetchListing(propertyId);

      if (!active) return;
      if (error) {
        console.error("Failed to load property:", error);
        setError("We could not load this property. Please try again.");
        setLoading(false);
        return;
      }

      setProperty(data);
      setLoading(false);
      if (!data) return;

      const [contactResult, similarResult] = await Promise.all([
        user && data.partner
          ? supabase.from("partner_contacts").select("*").eq("partner_id", data.partner.id).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase
          .from("properties")
          .select(LISTING_SELECT)
          .eq("propertyLocationTag", data.propertyLocationTag)
          .neq("id", propertyId)
          .order("id", { ascending: false })
          .limit(3),
      ]);

      if (!active) return;
      if (contactResult.data) setContact(contactResult.data);
      if (similarResult.data) setSimilar(similarResult.data);
    };

    load();

    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, user?.id]);

  // Check whether the signed-in user has saved this property
  useEffect(() => {
    setIsSaved(false);
    setSavedRecordId(null);
    setNotice("");
    if (!user || !Number.isInteger(propertyId)) return;

    let active = true;
    supabase
      .from("savedProperties")
      .select("id")
      .eq("userId", user.id)
      .eq("propertyId", propertyId)
      .limit(1)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Failed to check saved property:", error);
        } else if (data.length > 0) {
          setIsSaved(true);
          setSavedRecordId(data[0].id);
        }
      });

    return () => { active = false; };
  }, [propertyId, user]);

  const handleSaveToggle = async () => {
    if (!user) {
      navigate(signInLink);
      return;
    }
    if (isSaving) return;

    setIsSaving(true);
    setNotice("");

    if (isSaved) {
      const { error } = await supabase.from("savedProperties").delete().eq("id", savedRecordId);

      if (error) {
        console.error("Failed to unsave:", error);
        setNotice("error");
      } else {
        setIsSaved(false);
        setSavedRecordId(null);
      }
    } else {
      const { data, error } = await supabase
        .from("savedProperties")
        .insert([{ userId: user.id, propertyId }])
        .select();

      if (error || !data?.length) {
        console.error("Save failed:", error);
        setNotice("error");
      } else {
        setIsSaved(true);
        setSavedRecordId(data[0].id);
      }
    }

    setIsSaving(false);
  };

  if (loading || isAuthLoading) {
    return <MainLayout><DetailsSkeleton /></MainLayout>;
  }

  if (error || !property) {
    return (
      <MainLayout>
        <div className="shell pt-28">
          <EmptyState
            icon={SearchX}
            title={error ? "Something went wrong" : "Property not found"}
            text={error || "This property may have been removed, or the link may be mistyped."}
          >
            <Button to="/property">Browse properties</Button>
          </EmptyState>
        </div>
      </MainLayout>
    );
  }

  const { partner } = property;
  const isSold = property.status === "sold";

  // Listings keep the old realtor fields as a fallback for any row without a partner
  const listedBy = partner?.name || property.realtorName || "Propulse partner";
  const phone = contact?.phone || (user ? property.realtorContact : null);
  const whatsappNumber = toWhatsAppNumber(contact?.whatsapp || phone);
  const shareText = `${property.propertyName} in ${property.propertyLocation}, ₦${property.propertyPrice}, on Propulse`;
  const whatsappText = encodeURIComponent(
    `Hello, I am interested in ${property.propertyName} at ${property.propertyLocation} listed on Propulse.`
  );

  const photos = [
    property.propertyImage,
    ...[...(property.images ?? [])].sort((a, b) => a.position - b.position).map((image) => image.url),
  ].filter(Boolean);

  const amenities = (property.amenities ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const facts = [
    { label: "Property type", value: property.propertyTypeTag },
    { label: "Size", value: property.propertyDetails },
    { label: "State", value: property.propertyLocationTag },
    { label: "Title document", value: property.title_document },
  ].filter((fact) => fact.value);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: property.propertyName, text: shareText, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareNote("Link copied");
        setTimeout(() => setShareNote(""), 2500);
      }
    } catch (err) {
      // Closing the share sheet is not an error worth reporting
      if (err?.name !== "AbortError") setShareNote("Could not share this listing");
    }
  };

  return (
    <MainLayout>
      <Seo
        title={`${property.propertyName}, ${property.propertyLocation}`}
        description={`${property.propertyTypeTag ?? "Property"} for sale in ${property.propertyLocation}${property.propertyDetails ? `, ${property.propertyDetails}` : ""}, ₦${property.propertyPrice}. ${property.fullDescription ?? ""}`}
        image={photos[0]?.replace(/\.(jpe?g|png)$/i, "-1280.webp")}
        type="product"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            name: property.propertyName,
            description: property.fullDescription ?? undefined,
            url: absoluteUrl(`/property/${property.id}`),
            image: photos.map((photo) => absoluteUrl(photo)),
            datePosted: property.created_at,
            offers: {
              "@type": "Offer",
              price: Number(property.propertyPriceTag) || undefined,
              priceCurrency: "NGN",
              availability: isSold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
              seller: partner ? { "@type": "RealEstateAgent", name: partner.name, url: absoluteUrl(`/partners/${partner.slug}`) } : undefined,
            },
            contentLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressLocality: property.propertyLocation,
                addressRegion: property.propertyLocationTag,
                addressCountry: "NG",
              },
            },
          },
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Properties", path: "/property" },
            ...(property.propertyLocationTag
              ? [{ name: shortStateName(property.propertyLocationTag), path: `/property/in/${stateSlug(property.propertyLocationTag)}` }]
              : []),
            { name: property.propertyName, path: `/property/${property.id}` },
          ]),
        ]}
      />
      <motion.div
        key={property.id}
        className="shell pb-4 pt-28"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <Link
          to="/property"
          className="inline-flex items-center gap-2 text-muted transition-colors duration-300 hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
          All properties
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">
            {property.propertyName}
          </h1>
          <StatusLabel status={property.status} />
        </div>
        <p className="mt-3 flex items-center gap-2 text-lg text-muted">
          <MapPin className="size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          {property.propertyLocation}
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
          <div className="min-w-0">
            <PhotoGallery
              images={photos.length > 0 ? photos : [""]}
              alt={`${property.propertyName} in ${property.propertyLocation}`}
              dimmed={isSold}
            />

            {facts.length > 0 && (
              <Reveal as="dl" className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {facts.map((fact) => (
                  <div key={fact.label} className="rounded-2xl bg-tint px-5 py-4">
                    <dt className="text-sm text-muted">{fact.label}</dt>
                    <dd className="mt-1 font-semibold text-ink">{fact.value}</dd>
                  </div>
                ))}
              </Reveal>
            )}

            {property.fullDescription && (
              <Reveal as="section" className="mt-10">
                <h2 className="text-2xl font-semibold tracking-tight text-ink">About this property</h2>
                <p className="mt-3 max-w-[65ch] text-lg leading-relaxed text-muted">
                  {property.fullDescription}
                </p>
              </Reveal>
            )}

            {amenities.length > 0 && (
              <Reveal as="section" className="mt-10">
                <h2 className="text-2xl font-semibold tracking-tight text-ink">Amenities</h2>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {amenities.map((amenity) => (
                    <li
                      key={amenity}
                      className="flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-2 text-[15px] text-ink transition duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-ink"
                    >
                      <Check className="size-4 text-accent-deep" strokeWidth={2} aria-hidden="true" />
                      {amenity}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Spotlight className="rounded-3xl border border-line bg-panel p-6 shadow-card sm:p-8">
              <div className="relative">
                <p className="text-sm text-muted">{isSold ? "Sold for" : "Asking price"}</p>
                <p className="mt-1 text-4xl font-semibold tracking-tight text-ink">
                  ₦{property.propertyPrice}
                </p>

                {isSold ? (
                  <p className="mt-6 rounded-2xl bg-tint px-4 py-3 text-muted">
                    This property has been sold. Browse similar listings below.
                  </p>
                ) : (
                  <div className="mt-6 flex flex-col gap-3">
                    <Magnetic strength={0.15} className="w-full">
                      <Button size="lg" className="w-full" onClick={() => (user ? setShowForm(true) : navigate(signInLink))}>
                        <Send className="size-4" strokeWidth={2} aria-hidden="true" />
                        Contact partner
                      </Button>
                    </Magnetic>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full"
                      onClick={handleSaveToggle}
                      disabled={isSaving}
                      aria-pressed={isSaved}
                    >
                      <Heart
                        className={`size-4 transition-colors duration-300 ${isSaved ? "fill-accent text-accent" : ""}`}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      {isSaved ? "Saved" : "Save for later"}
                    </Button>
                  </div>
                )}

                {!user && !isSold && (
                  <p className="mt-4 flex items-start gap-2 text-sm text-muted">
                    <Lock className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    <span>
                      <Link to={signInLink} className="font-medium text-accent-deep underline underline-offset-2">Sign in</Link> or{" "}
                      <Link to={authLink(`/property/${id}`, "/signup")} className="font-medium text-accent-deep underline underline-offset-2">create a free account</Link>{" "}
                      to save this property and contact the partner.
                    </span>
                  </p>
                )}
                {notice === "error" && (
                  <p className="mt-4 text-sm text-danger" role="alert">
                    We could not update your saved properties. Please try again.
                  </p>
                )}

                <div className="mt-8 border-t border-line pt-6">
                  <p className="text-sm text-muted">Listed by</p>
                  <div className="mt-3 flex items-center gap-4">
                    <PartnerLogo partner={partner ?? { name: listedBy }} className="size-14" />
                    <div className="min-w-0">
                      {partner ? (
                        <Link
                          to={`/partners/${partner.slug}`}
                          className="block truncate text-lg font-semibold text-ink underline-offset-4 hover:underline"
                        >
                          {partner.name}
                        </Link>
                      ) : (
                        <p className="truncate text-lg font-semibold text-ink">{listedBy}</p>
                      )}
                      {partner?.verified_at && (
                        <p className="flex items-center gap-1.5 text-sm font-medium text-accent-deep">
                          <BadgeCheck className="size-4" strokeWidth={2} aria-hidden="true" />
                          Verified partner
                        </p>
                      )}
                    </div>
                  </div>

                  {user ? (
                    (contact?.contact_person || phone) && (
                      <p className="mt-4 text-muted">
                        {contact?.contact_person && <span className="text-ink">{contact.contact_person}</span>}
                        {contact?.contact_person && phone && ", "}
                        {phone}
                      </p>
                    )
                  ) : (
                    <p className="mt-4 text-muted">Sign in to see contact details.</p>
                  )}

                  {user && phone && !isSold && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Button variant="secondary" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
                        <Phone className="size-4" strokeWidth={2} aria-hidden="true" />
                        Call
                      </Button>
                      {whatsappNumber && (
                        <Button
                          variant="secondary"
                          href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="size-4" strokeWidth={2} aria-hidden="true" />
                          WhatsApp
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-line pt-6">
                  <p className="text-sm text-muted">Share this listing</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${window.location.href}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Share2 className="size-4" strokeWidth={2} aria-hidden="true" />
                      WhatsApp
                    </Button>
                    <Button variant="secondary" onClick={handleShare}>
                      <Link2 className="size-4" strokeWidth={2} aria-hidden="true" />
                      {shareNote || "Share link"}
                    </Button>
                  </div>
                </div>
              </div>
            </Spotlight>
          </aside>
        </div>
      </motion.div>

      {similar.length > 0 && (
        <section className="shell pt-24">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tighter text-ink sm:text-4xl">
              More in {property.propertyLocationTag}
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((entry, index) => (
              <Reveal key={entry.id} delay={index * 0.08}>
                <PropertyCard property={entry} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {showForm && <InquiryModal property={property} user={user} onClose={closeForm} />}
      </AnimatePresence>
    </MainLayout>
  );
};

export default PropertyDetails;
