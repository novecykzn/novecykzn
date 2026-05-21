-- =============================================================================
-- NOVECYWEB — run this entire script once in Supabase → SQL Editor → Run
-- Safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS)
-- =============================================================================

-- Signed scripts (00003)
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

-- Order tracking (00002)
alter table public.orders
  add column if not exists tracking_number text,
  add column if not exists tracking_courier text,
  add column if not exists tracking_url text,
  add column if not exists packed_at timestamptz;

-- Payment methods (00004 + 00005)
alter table public.profiles
  add column if not exists on_account_approved boolean not null default false;

alter table public.orders
  add column if not exists payment_method text;

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (
    payment_status in (
      'pending_payment',
      'paid',
      'failed',
      'cancelled',
      'refunded',
      'awaiting_eft',
      'pop_received',
      'on_account'
    )
  );

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (
    payment_method is null
    or payment_method in ('online', 'eft', 'on_account')
  );

-- Providers read own application
drop policy if exists "Providers read own application" on public.applications;
create policy "Providers read own application"
  on public.applications for select
  using (
    public.is_provider(auth.uid())
    and (
      applicant_user_id = auth.uid()
      or lower(email) = lower((select email from public.profiles where id = auth.uid()))
    )
  );

-- Order scripts storage
insert into storage.buckets (id, name, public)
values ('order-scripts', 'order-scripts', false)
on conflict (id) do nothing;

drop policy if exists "Providers upload own order scripts" on storage.objects;
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

drop policy if exists "Providers read own order scripts" on storage.objects;
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

drop policy if exists "Providers update own order scripts" on storage.objects;
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

drop policy if exists "Admins read order scripts" on storage.objects;
create policy "Admins read order scripts"
  on storage.objects for select
  using (
    bucket_id = 'order-scripts'
    and public.is_admin(auth.uid())
  );
