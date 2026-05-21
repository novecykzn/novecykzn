-- NOVECY compounding lab — initial schema, RLS, storage

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'pending' check (role in ('admin', 'provider', 'pending')),
  full_name text,
  email text,
  phone text,
  company_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (lower(email));
create index profiles_role_idx on public.profiles (role);

-- Applications (provider access requests)
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company_name text not null,
  role text not null check (role in ('doctor', 'pharmacist', 'clinic', 'pharmacy', 'other')),
  registration_number text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  province text not null,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'needs_more_info')),
  google_sheet_row_id text,
  internal_notes text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  applicant_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_status_idx on public.applications (status);
create index applications_email_idx on public.applications (lower(email));
create index applications_created_idx on public.applications (created_at desc);

-- Application documents (private files)
create table public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  file_url text not null,
  file_name text not null,
  file_type text,
  created_at timestamptz not null default now()
);

create index application_documents_app_idx on public.application_documents (application_id);

-- Products (catalogue)
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  strength text,
  unit_size text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'ZAR',
  availability_status text not null default 'available',
  requires_special_approval boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products (category);
create index products_active_idx on public.products (is_active);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles (id) on delete restrict,
  status text not null default 'draft'
    check (status in ('draft', 'pending_payment', 'paid', 'processing', 'completed', 'cancelled')),
  payment_status text not null default 'pending_payment'
    check (payment_status in ('pending_payment', 'paid', 'failed', 'cancelled', 'refunded')),
  payment_provider text,
  payment_reference text,
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  currency text not null default 'ZAR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_provider_idx on public.orders (provider_id);
create index orders_status_idx on public.orders (status);
create index orders_created_idx on public.orders (created_at desc);

-- Order line items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name_snapshot text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  total_price_cents integer not null check (total_price_cents >= 0),
  created_at timestamptz not null default now()
);

create index order_items_order_idx on public.order_items (order_id);

-- Payment audit records
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider_id uuid not null references public.profiles (id),
  provider_name text,
  payment_provider text not null,
  external_payment_id text,
  amount_cents integer not null,
  currency text not null default 'ZAR',
  status text not null,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_order_idx on public.payments (order_id);

-- updated_at triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger applications_updated_at before update on public.applications
  for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

-- New auth user → profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'pending'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.application_documents enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

create or replace function public.is_provider(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'provider'
  );
$$;

-- Profiles
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

-- Applications: staff-only via client; inserts via service role only (no insert policy for anon/authenticated)
create policy "Admins manage applications"
  on public.applications for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Documents
create policy "Admins manage application_documents"
  on public.application_documents for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Products: read for providers + admin; write admin only
create policy "Providers read active products"
  on public.products for select
  using (
    public.is_provider(auth.uid())
    and is_active = true
  );

create policy "Admins read all products"
  on public.products for select
  using (public.is_admin(auth.uid()));

create policy "Admins manage products"
  on public.products for insert
  with check (public.is_admin(auth.uid()));

create policy "Admins update products"
  on public.products for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Orders: providers own; admins all
create policy "Providers own orders"
  on public.orders for select
  using (auth.uid() = provider_id and public.is_provider(auth.uid()));

create policy "Providers insert own draft orders"
  on public.orders for insert
  with check (
    auth.uid() = provider_id
    and public.is_provider(auth.uid())
    and status = 'draft'
  );

create policy "Providers update own draft or pending_payment"
  on public.orders for update
  using (
    auth.uid() = provider_id
    and public.is_provider(auth.uid())
    and status in ('draft', 'pending_payment')
  );

create policy "Providers delete own draft orders"
  on public.orders for delete
  using (
    auth.uid() = provider_id
    and public.is_provider(auth.uid())
    and status = 'draft'
  );

create policy "Admins all orders"
  on public.orders for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Order items
create policy "Providers order_items for own orders"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.provider_id = auth.uid()
    )
    and public.is_provider(auth.uid())
  );

create policy "Providers insert items own draft order"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.provider_id = auth.uid() and o.status = 'draft'
    )
    and public.is_provider(auth.uid())
  );

create policy "Providers update items own draft order"
  on public.order_items for update
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.provider_id = auth.uid() and o.status = 'draft'
    )
  );

create policy "Providers delete items own draft order"
  on public.order_items for delete
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.provider_id = auth.uid() and o.status = 'draft'
    )
  );

create policy "Admins all order_items"
  on public.order_items for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Payments
create policy "Providers read own payments"
  on public.payments for select
  using (provider_id = auth.uid() and public.is_provider(auth.uid()));

create policy "Admins all payments"
  on public.payments for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Storage: application documents bucket
insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do nothing;

create policy "Admins read application documents"
  on storage.objects for select
  using (
    bucket_id = 'application-documents'
    and public.is_admin(auth.uid())
  );

-- Service role uploads bypass RLS; authenticated users have no direct upload to this bucket from client
