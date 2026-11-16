# partners_listing_fields_images_admin_rules

Applied to the Supabase project on 2026-11-15 as migration version `20261115012233`.
The exact SQL is stored in the project's migration history; run `supabase db pull`
(or read `supabase_migrations.schema_migrations`) to get it as a `.sql` file.

## What it created

| Object | Purpose |
| --- | --- |
| `private.is_admin()` | One definition of "is the caller a Propulse admin". Used by every rule below. |
| `public.partners` | Verified partners: name, slug, logo, description, states, verified date, active switch. |
| `public.partner_contacts` | Contact person, phone, WhatsApp, email. Kept apart so only signed-in users can read it. |
| `properties.partner_id` | The partner a listing belongs to. A partner with listings cannot be deleted. |
| `properties.status` | `available`, `under_offer` or `sold`. |
| `properties.title_document` | For example Certificate of Occupancy. |
| `properties.is_published` | Lets an admin hide a listing without removing it. |
| `public.property_images` | Extra photos for a listing. The cover stays in `properties."propertyImage"`. |
| `inquiries.status` | `new`, `contacted` or `closed`, for the admin inbox. |

## Access rules

- Anyone can read active partners, published listings of active partners, and listing photos.
- Only signed-in users can read partner contact details.
- Only admins can add, change or remove partners, contacts, listings and photos, change an
  inquiry's status, or upload to the `property-images` storage bucket.
- Admins also see paused partners and unpublished listings.

## Sample data

Six fictional partners, fifteen listings and their gallery photos were loaded with plain SQL
after this migration. They are stand-ins: replace them through the admin area before launch.
