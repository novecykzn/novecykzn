-- EFT workflow: proof of payment (POP) received via email

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
