-- Payment methods: online gateway, EFT, on-account (approved professionals only)

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
      'on_account'
    )
  );

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (
    payment_method is null
    or payment_method in ('online', 'eft', 'on_account')
  );

create index if not exists profiles_on_account_idx on public.profiles (on_account_approved)
  where on_account_approved = true;
