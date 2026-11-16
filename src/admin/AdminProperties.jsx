import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Building2, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import supabase from "../lib/supabase";
import {
  LISTING_STATUS, NIGERIAN_STATES, PROPERTY_TYPES, TITLE_DOCUMENTS, formatAmount,
} from "../lib/constants";
import { invalidateProperties } from "../lib/useProperties";
import Button from "../components/button";
import EmptyState from "../components/EmptyState";
import Field from "../components/Field";
import ListingImage from "../components/ListingImage";
import Select from "../components/Select";
import { StatusLabel } from "../components/PropertyCard";
import { describeError } from "./errors";
import { AdminHeader, Drawer, ErrorNote, ImagePicker, Toggle } from "./ui";

const EMPTY = {
  id: null,
  partner_id: "",
  name: "",
  type: "House",
  state: "",
  location: "",
  details: "",
  price: "",
  title_document: "",
  status: "available",
  is_published: true,
  description: "",
  amenities: "",
  photos: [],
};

/** A listing row from the database, reshaped for the form. The first photo is the cover. */
const toForm = (listing) => ({
  id: listing.id,
  partner_id: listing.partner_id ? String(listing.partner_id) : "",
  name: listing.propertyName ?? "",
  type: listing.propertyTypeTag ?? "House",
  state: listing.propertyLocationTag ?? "",
  location: listing.propertyLocation ?? "",
  details: listing.propertyDetails ?? "",
  price: listing.propertyPriceTag ? String(listing.propertyPriceTag) : "",
  title_document: listing.title_document ?? "",
  status: listing.status ?? "available",
  is_published: listing.is_published,
  description: listing.fullDescription ?? "",
  amenities: listing.amenities ?? "",
  photos: [
    listing.propertyImage,
    ...[...(listing.images ?? [])].sort((a, b) => a.position - b.position).map((image) => image.url),
  ].filter(Boolean),
});

const validate = (form) => {
  if (!form.partner_id) return "Please choose the partner this listing belongs to.";
  if (form.name.trim().length < 2) return "Please enter the property name.";
  if (!form.state) return "Please choose a state.";
  if (!form.location.trim()) return "Please enter the area or city.";
  if (!(Number(form.price) > 0)) return "Please enter the price in naira as a number.";
  if (form.photos.length === 0) return "Please upload at least one photo.";
  return null;
};

const AdminProperties = () => {
  const [listings, setListings] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const load = useCallback(async () => {
    const [listingResult, partnerResult] = await Promise.all([
      supabase
        .from("properties")
        .select("*, partner:partners(id, name, is_active), images:property_images(id, url, position)")
        .order("id", { ascending: false }),
      supabase.from("partners").select("id, name, is_active").order("name"),
    ]);

    const error = listingResult.error || partnerResult.error;
    if (error) {
      console.error("Failed to load listings:", error);
      setLoadError(describeError(error, "We could not load the listings."));
    } else {
      setListings(listingResult.data);
      setPartners(partnerResult.data);
      setLoadError("");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // /admin/properties?new=1 opens an empty form once the partner list has loaded
  useEffect(() => {
    if (searchParams.get("new") !== "1" || loading || partners.length === 0) return;
    setFormError("");
    setForm(EMPTY);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, loading, partners.length]);

  const closeForm = useCallback(() => setForm(null), []);
  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const handleInput = (event) => setField(event.target.name, event.target.value);

  const makeCover = (url) =>
    setForm((prev) => ({ ...prev, photos: [url, ...prev.photos.filter((photo) => photo !== url)] }));
  const removePhoto = (url) =>
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((photo) => photo !== url) }));

  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;

    const problem = validate(form);
    if (problem) {
      setFormError(problem);
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const partner = partners.find((entry) => String(entry.id) === form.partner_id);
      const price = Math.round(Number(form.price));
      const description = form.description.trim();
      const [cover, ...gallery] = form.photos;

      const record = {
        partner_id: Number(form.partner_id),
        propertyName: form.name.trim(),
        propertyTypeTag: form.type,
        propertyLocationTag: form.state,
        propertyLocation: form.location.trim(),
        propertyDetails: form.details.trim() || null,
        // The price is kept both as a number (for sorting and filters) and as display text
        propertyPriceTag: price,
        propertyPrice: formatAmount(price),
        title_document: form.title_document || null,
        status: form.status,
        is_published: form.is_published,
        fullDescription: description || null,
        propertyBrief: description.slice(0, 90) || null,
        amenities: form.amenities.split(",").map((entry) => entry.trim()).filter(Boolean).join(", ") || null,
        propertyImage: cover,
        realtorName: partner?.name ?? null,
        updated_at: new Date().toISOString(),
      };

      let listingId = form.id;
      if (listingId) {
        const { error } = await supabase.from("properties").update(record).eq("id", listingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("properties").insert(record).select("id").single();
        if (error) throw error;
        listingId = data.id;
      }

      // Replace the extra photos with the current list, in order
      const { error: clearError } = await supabase.from("property_images").delete().eq("property_id", listingId);
      if (clearError) throw clearError;
      if (gallery.length > 0) {
        const { error: photoError } = await supabase
          .from("property_images")
          .insert(gallery.map((url, index) => ({ property_id: listingId, url, position: index + 1 })));
        if (photoError) throw photoError;
      }

      invalidateProperties();
      setForm(null);
      await load();
    } catch (error) {
      console.error("Failed to save listing:", error);
      setFormError(describeError(error, "We could not save this listing."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (listing) => {
    if (!window.confirm(`Remove "${listing.propertyName}"? This cannot be undone.`)) return;

    const { error } = await supabase.from("properties").delete().eq("id", listing.id);
    if (error) {
      console.error("Failed to remove listing:", error);
      setLoadError(describeError(error, "We could not remove this listing."));
      return;
    }
    invalidateProperties();
    await load();
  };

  const term = query.trim().toLowerCase();
  const visible = term
    ? listings.filter((listing) =>
        `${listing.propertyName} ${listing.propertyLocation} ${listing.partner?.name ?? ""}`.toLowerCase().includes(term)
      )
    : listings;

  return (
    <>
      <AdminHeader
        title="Properties"
        text="Every listing on Propulse. Each one belongs to a verified partner."
      >
        <Button onClick={() => { setFormError(""); setForm(EMPTY); }} disabled={partners.length === 0}>
          <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
          Add property
        </Button>
      </AdminHeader>

      <ErrorNote>{loadError}</ErrorNote>

      <label className="relative mb-5 block max-w-md">
        <span className="sr-only">Search listings</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" strokeWidth={1.75} aria-hidden="true" />
        <input
          type="search"
          className="field-input !rounded-full !pl-11"
          placeholder="Search by name, area or partner"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {loading ? (
        <div className="flex flex-col gap-3" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton h-24 !rounded-2xl" />)}
        </div>
      ) : partners.length === 0 && !loadError ? (
        <EmptyState
          icon={Building2}
          title="Add a partner first"
          text="Listings belong to a verified partner, so create the partner before adding their properties."
        >
          <Button to="/admin/partners">Go to partners</Button>
        </EmptyState>
      ) : visible.length === 0 && !loadError ? (
        <EmptyState
          icon={Building2}
          title={term ? "No listings match your search" : "No listings yet"}
          text={term ? "Try a different name, area or partner." : "Add the first property for one of your partners."}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((listing) => (
            <li key={listing.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-panel p-3">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-tint">
                <ListingImage src={listing.propertyImage} loading="lazy" sizes="80px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                  {listing.propertyName}
                  <StatusLabel status={listing.status} className="!px-2.5 !py-0.5 font-normal" />
                  {!listing.is_published && (
                    <span className="rounded-full bg-tint px-2.5 py-0.5 text-sm font-normal text-muted">Hidden</span>
                  )}
                  {listing.partner && !listing.partner.is_active && (
                    <span className="rounded-full bg-tint px-2.5 py-0.5 text-sm font-normal text-muted">Partner paused</span>
                  )}
                </p>
                <p className="truncate text-sm text-muted">
                  {listing.propertyTypeTag}, {listing.propertyLocation}, {listing.propertyLocationTag}
                </p>
                <p className="truncate text-sm text-muted">
                  <span className="font-medium text-ink">₦{listing.propertyPrice}</span>
                  {listing.partner ? `, ${listing.partner.name}` : ", no partner"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => { setFormError(""); setForm(toForm(listing)); }}>
                  <Pencil className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  Edit
                </Button>
                <Button variant="danger" size="sm" aria-label={`Remove ${listing.propertyName}`} onClick={() => handleDelete(listing)}>
                  <Trash2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Drawer open={Boolean(form)} title={form?.id ? "Edit property" : "Add property"} onClose={closeForm}>
        {form && (
          <form onSubmit={handleSave} noValidate className="flex flex-col gap-5">
            <Field label="Partner" hint="Only verified partners can have listings.">
              {(props) => (
                <Select
                  {...props}
                  placeholder="Choose a partner"
                  value={form.partner_id}
                  onChange={(value) => setField("partner_id", value)}
                  options={partners.map((partner) => ({
                    value: String(partner.id),
                    label: `${partner.name}${partner.is_active ? "" : " (paused)"}`,
                  }))}
                />
              )}
            </Field>

            <Field label="Property name">
              {(props) => <input {...props} name="name" value={form.name} onChange={handleInput} />}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                {(props) => (
                  <Select {...props} value={form.type} onChange={(value) => setField("type", value)} options={PROPERTY_TYPES} />
                )}
              </Field>
              <Field label="Size or layout" hint="For example: 600 sqm plot, or 4-bedroom duplex.">
                {(props) => <input {...props} name="details" value={form.details} onChange={handleInput} />}
              </Field>
              <Field label="State">
                {(props) => (
                  <Select {...props} placeholder="Choose a state" value={form.state} onChange={(value) => setField("state", value)} options={NIGERIAN_STATES} />
                )}
              </Field>
              <Field label="Area and city" hint="For example: Lekki Phase 1, Lagos.">
                {(props) => <input {...props} name="location" value={form.location} onChange={handleInput} />}
              </Field>
              <Field
                label="Price in naira"
                hint={Number(form.price) > 0 ? `Shown as ₦${formatAmount(Math.round(Number(form.price)))}` : "Numbers only."}
              >
                {(props) => (
                  <input {...props} type="number" min="0" step="1000" inputMode="numeric" name="price" value={form.price} onChange={handleInput} />
                )}
              </Field>
              <Field label="Title document">
                {(props) => (
                  <Select
                    {...props}
                    value={form.title_document}
                    onChange={(value) => setField("title_document", value)}
                    options={[{ value: "", label: "Not stated" }, ...TITLE_DOCUMENTS]}
                  />
                )}
              </Field>
            </div>

            <Field label="Description">
              {(props) => <textarea {...props} name="description" value={form.description} onChange={handleInput} />}
            </Field>
            <Field label="Amenities" hint="Separate each one with a comma.">
              {(props) => <input {...props} name="amenities" value={form.amenities} onChange={handleInput} />}
            </Field>

            <div>
              <p className="text-sm font-medium text-ink">Photos</p>
              <p className="mt-0.5 text-sm text-muted">The first photo is the cover. Use the star to choose a different cover.</p>
              {form.photos.length > 0 && (
                <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {form.photos.map((url, index) => (
                    <li key={url} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-tint">
                      <ListingImage src={url} sizes="160px" />
                      {index === 0 ? (
                        <span className="absolute left-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-xs text-white">Cover</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => makeCover(url)}
                          aria-label="Use as cover photo"
                          className="absolute left-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-panel text-ink shadow-card hover:bg-accent"
                        >
                          <Star className="size-3.5" strokeWidth={2} aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(url)}
                        aria-label="Remove photo"
                        className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-panel text-ink shadow-card hover:bg-ink hover:text-white"
                      >
                        <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3">
                <ImagePicker
                  label="Upload photos"
                  folder="listings"
                  multiple
                  onUploaded={(url) => setForm((prev) => ({ ...prev, photos: [...prev.photos, url] }))}
                />
              </div>
            </div>

            <Field label="Sale status">
              {(props) => (
                <Select
                  {...props}
                  value={form.status}
                  onChange={(value) => setField("status", value)}
                  options={Object.entries(LISTING_STATUS).map(([value, label]) => ({ value, label }))}
                />
              )}
            </Field>
            <Toggle
              label="Published"
              hint="Turn off to hide this listing from the public site without removing it."
              checked={form.is_published}
              onChange={(value) => setField("is_published", value)}
            />

            <ErrorNote>{formError}</ErrorNote>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={closeForm}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save property"}</Button>
            </div>
          </form>
        )}
      </Drawer>
    </>
  );
};

export default AdminProperties;
