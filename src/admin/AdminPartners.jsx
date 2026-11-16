import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Pencil, Plus, Trash2 } from "lucide-react";
import supabase from "../lib/supabase";
import { NIGERIAN_STATES, slugify } from "../lib/constants";
import { invalidateProperties } from "../lib/useProperties";
import Button from "../components/button";
import EmptyState from "../components/EmptyState";
import Field from "../components/Field";
import { PartnerLogo } from "../components/PartnerBadge";
import { describeError } from "./errors";
import { AdminHeader, Drawer, ErrorNote, ImagePicker, Toggle } from "./ui";

const EMPTY = {
  id: null,
  name: "",
  description: "",
  logo_url: "",
  states: [],
  verified: true,
  verified_at: null,
  is_active: true,
  contact_person: "",
  phone: "",
  whatsapp: "",
  email: "",
};

const today = () => new Date().toISOString().slice(0, 10);

// The contact row comes back as an object or a one-item list depending on the query shape
const contactOf = (partner) => (Array.isArray(partner.contact) ? partner.contact[0] : partner.contact) ?? {};

const toForm = (partner) => {
  const contact = contactOf(partner);
  return {
    id: partner.id,
    name: partner.name,
    description: partner.description ?? "",
    logo_url: partner.logo_url ?? "",
    states: partner.states ?? [],
    verified: Boolean(partner.verified_at),
    verified_at: partner.verified_at,
    is_active: partner.is_active,
    contact_person: contact.contact_person ?? "",
    phone: contact.phone ?? "",
    whatsapp: contact.whatsapp ?? "",
    email: contact.email ?? "",
  };
};

const AdminPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("partners")
      .select("*, contact:partner_contacts(*), properties(count)")
      .order("name");

    if (error) {
      console.error("Failed to load partners:", error);
      setLoadError(describeError(error, "We could not load the partners."));
    } else {
      setPartners(data);
      setLoadError("");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const closeForm = useCallback(() => setForm(null), []);
  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const handleInput = (event) => setField(event.target.name, event.target.value);

  const toggleState = (state) =>
    setForm((prev) => ({
      ...prev,
      states: prev.states.includes(state) ? prev.states.filter((entry) => entry !== state) : [...prev.states, state],
    }));

  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;

    const name = form.name.trim();
    if (name.length < 2) {
      setFormError("Please enter the partner's name.");
      return;
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setFormError("Please enter a valid email address, or leave it empty.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const record = {
        name,
        description: form.description.trim() || null,
        logo_url: form.logo_url || null,
        states: form.states,
        // Keep the original verification date when the partner was already verified
        verified_at: form.verified ? form.verified_at ?? today() : null,
        is_active: form.is_active,
      };

      let partnerId = form.id;
      if (partnerId) {
        const { error } = await supabase.from("partners").update(record).eq("id", partnerId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("partners")
          .insert({ ...record, slug: slugify(name) })
          .select("id")
          .single();
        if (error) throw error;
        partnerId = data.id;
      }

      const { error: contactError } = await supabase.from("partner_contacts").upsert({
        partner_id: partnerId,
        contact_person: form.contact_person.trim() || null,
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        email: form.email.trim() || null,
      });
      if (contactError) throw contactError;

      // Pausing or renaming a partner changes what the public catalog shows
      invalidateProperties();
      setForm(null);
      await load();
    } catch (error) {
      console.error("Failed to save partner:", error);
      setFormError(describeError(error, "We could not save this partner."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (partner) => {
    if (!window.confirm(`Remove ${partner.name}? This cannot be undone.`)) return;

    const { error } = await supabase.from("partners").delete().eq("id", partner.id);
    if (error) {
      console.error("Failed to remove partner:", error);
      setLoadError(describeError(error, "We could not remove this partner."));
      return;
    }
    await load();
  };

  return (
    <>
      <AdminHeader
        title="Partners"
        text="The verified firms whose properties appear on Propulse. Pausing a partner hides all of their listings from the public site."
      >
        <Button onClick={() => { setFormError(""); setForm(EMPTY); }}>
          <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
          Add partner
        </Button>
      </AdminHeader>

      <ErrorNote>{loadError}</ErrorNote>

      {loading ? (
        <div className="flex flex-col gap-3" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-20 !rounded-2xl" />)}
        </div>
      ) : partners.length === 0 && !loadError ? (
        <EmptyState
          icon={BadgeCheck}
          title="No partners yet"
          text="Add your first verified partner, then list their properties."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {partners.map((partner) => {
            const listingCount = partner.properties?.[0]?.count ?? 0;
            const contact = contactOf(partner);

            return (
              <li
                key={partner.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-panel p-4"
              >
                <PartnerLogo partner={partner} className="size-12" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                    {partner.name}
                    {partner.verified_at && (
                      <BadgeCheck className="size-4 text-accent-deep" strokeWidth={2} aria-label="Verified" />
                    )}
                    {!partner.is_active && (
                      <span className="rounded-full bg-tint px-2.5 py-0.5 text-sm font-normal text-muted">Paused</span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {listingCount} {listingCount === 1 ? "listing" : "listings"}
                    {partner.states?.length > 0 && `, ${partner.states.join(", ")}`}
                    {contact.contact_person && `, contact: ${contact.contact_person}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setFormError(""); setForm(toForm(partner)); }}>
                    <Pencil className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    Edit
                  </Button>
                  {listingCount === 0 && (
                    <Button variant="danger" size="sm" aria-label={`Remove ${partner.name}`} onClick={() => handleDelete(partner)}>
                      <Trash2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Drawer open={Boolean(form)} title={form?.id ? "Edit partner" : "Add partner"} onClose={closeForm}>
        {form && (
          <form onSubmit={handleSave} noValidate className="flex flex-col gap-5">
            <Field label="Company name">
              {(props) => <input {...props} name="name" value={form.name} onChange={handleInput} />}
            </Field>

            <div>
              <p className="text-sm font-medium text-ink">Logo</p>
              <div className="mt-2 flex items-center gap-4">
                <PartnerLogo partner={{ name: form.name || "Partner", logo_url: form.logo_url }} className="size-16" />
                <ImagePicker
                  label={form.logo_url ? "Replace logo" : "Upload logo"}
                  folder="partners"
                  onUploaded={(url) => setField("logo_url", url)}
                />
              </div>
            </div>

            <Field label="About the partner" hint="Shown on the partner's public page.">
              {(props) => <textarea {...props} name="description" value={form.description} onChange={handleInput} />}
            </Field>

            <fieldset>
              <legend className="text-sm font-medium text-ink">States they operate in</legend>
              <div className="mt-2 grid max-h-56 grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto rounded-2xl border border-line p-4 sm:grid-cols-3">
                {NIGERIAN_STATES.map((state) => (
                  <label key={state} className="flex cursor-pointer items-center gap-2 text-[15px] text-ink">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--color-ink)]"
                      checked={form.states.includes(state)}
                      onChange={() => toggleState(state)}
                    />
                    {state}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact person">
                {(props) => <input {...props} name="contact_person" value={form.contact_person} onChange={handleInput} />}
              </Field>
              <Field label="Email" hint="Inquiries will be sent here once email is connected.">
                {(props) => <input {...props} type="email" name="email" value={form.email} onChange={handleInput} />}
              </Field>
              <Field label="Phone">
                {(props) => <input {...props} type="tel" name="phone" value={form.phone} onChange={handleInput} />}
              </Field>
              <Field label="WhatsApp number">
                {(props) => <input {...props} type="tel" name="whatsapp" value={form.whatsapp} onChange={handleInput} />}
              </Field>
            </div>

            <Toggle
              label="Verified"
              hint="Shows the verified mark beside this partner and their listings."
              checked={form.verified}
              onChange={(value) => setField("verified", value)}
            />
            <Toggle
              label="Active"
              hint="Turn off to pause the partner and hide all of their listings."
              checked={form.is_active}
              onChange={(value) => setField("is_active", value)}
            />

            <ErrorNote>{formError}</ErrorNote>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={closeForm}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save partner"}</Button>
            </div>
          </form>
        )}
      </Drawer>
    </>
  );
};

export default AdminPartners;
