-- Signed order script (compliance): provider downloads PDF, signs, re-uploads before checkout

alter table public.profiles
  add column if not exists registration_number text,
  add column if not exists practice_role text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists province text;

alter table public.orders
  add column if not exists signed_script_path text,
  add column if not exists signed_script_file_name text,
  add column if not exists signed_script_uploaded_at timestamptz;

-- Providers may read their own approved application (for profile/script details)
create policy "Providers read own application"
  on public.applications for select
  using (
    public.is_provider(auth.uid())
    and (
      applicant_user_id = auth.uid()
      or lower(email) = lower((select email from public.profiles where id = auth.uid()))
    )
  );

-- Storage: signed order scripts (private)
insert into storage.buckets (id, name, public)
values ('order-scripts', 'order-scripts', false)
on conflict (id) do nothing;

create policy "Providers upload own order scripts"
  on storage.objects for insert
  with check (
    bucket_id = 'order-scripts'
    and public.is_provider(auth.uid())
    and exists (
      select 1 from public.orders o
      where o.id::text = (storage.foldername(name))[1]
        and o.provider_id = auth.uid()
        and o.status = 'draft'
    )
  );

create policy "Providers read own order scripts"
  on storage.objects for select
  using (
    bucket_id = 'order-scripts'
    and public.is_provider(auth.uid())
    and exists (
      select 1 from public.orders o
      where o.id::text = (storage.foldername(name))[1]
        and o.provider_id = auth.uid()
    )
  );

create policy "Providers update own order scripts"
  on storage.objects for update
  using (
    bucket_id = 'order-scripts'
    and public.is_provider(auth.uid())
    and exists (
      select 1 from public.orders o
      where o.id::text = (storage.foldername(name))[1]
        and o.provider_id = auth.uid()
        and o.status = 'draft'
    )
  );

create policy "Admins read order scripts"
  on storage.objects for select
  using (
    bucket_id = 'order-scripts'
    and public.is_admin(auth.uid())
  );
