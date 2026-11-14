-- APPLIED by hand in the Supabase SQL editor on 2026-11-14.
-- Signed-in users can read only their own profile and can no longer set is_admin themselves.

drop policy if exists "select" on public.user_profile;
create policy "users read own profile" on public.user_profile
  for select to authenticated using (auth_user = (select auth.uid()));

revoke insert, update on public.user_profile from anon, authenticated;
grant insert (auth_user, email, username, fullname, image) on public.user_profile to authenticated;
grant update (email, username, fullname, image, updated_at) on public.user_profile to authenticated;
