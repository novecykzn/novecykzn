import type { SupabaseClient } from "@supabase/supabase-js";

export async function getOrCreateDraftOrder(
  supabase: SupabaseClient,
  providerId: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("provider_id", providerId)
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabase
    .from("orders")
    .insert({
      provider_id: providerId,
      status: "draft",
      payment_status: "pending_payment",
      total_cents: 0,
      subtotal_cents: 0,
    })
    .select("id")
    .single();

  if (error || !created) throw new Error(error?.message ?? "Could not create draft order");
  return created.id as string;
}

export async function recalcOrderTotals(supabase: SupabaseClient, orderId: string) {
  const { data: items } = await supabase
    .from("order_items")
    .select("total_price_cents")
    .eq("order_id", orderId);

  const subtotal = (items ?? []).reduce((s, i) => s + (i.total_price_cents ?? 0), 0);

  await supabase
    .from("orders")
    .update({
      subtotal_cents: subtotal,
      total_cents: subtotal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
}
