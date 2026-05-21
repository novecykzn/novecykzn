-- Order tracking fields for admin fulfilment workflow
alter table public.orders
  add column if not exists tracking_number text,
  add column if not exists tracking_courier text,
  add column if not exists tracking_url text,
  add column if not exists packed_at timestamptz;

create index if not exists orders_packed_at_idx on public.orders (packed_at desc);
