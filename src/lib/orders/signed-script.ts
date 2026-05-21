import type { SupabaseClient } from "@supabase/supabase-js";

/** Clear uploaded script when cart lines change so checkout stays compliant. */
export async function clearSignedScript(supabase: SupabaseClient, orderId: string) {
  const { data: order } = await supabase
    .from("orders")
    .select("signed_script_path")
    .eq("id", orderId)
    .single();

  if (order?.signed_script_path) {
    await supabase.storage.from("order-scripts").remove([order.signed_script_path as string]);
  }

  await supabase
    .from("orders")
    .update({
      signed_script_path: null,
      signed_script_file_name: null,
      signed_script_uploaded_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
}

export function orderHasSignedScript(order: {
  signed_script_path?: string | null;
  signed_script_uploaded_at?: string | null;
}) {
  return Boolean(order.signed_script_path && order.signed_script_uploaded_at);
}
