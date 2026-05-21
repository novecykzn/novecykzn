"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProvider } from "@/lib/auth/session";
import { finalizeCheckout } from "@/lib/orders/checkout";
import { getOrCreateDraftOrder, recalcOrderTotals } from "@/lib/orders/draft";
import { clearSignedScript } from "@/lib/orders/signed-script";
import type { PaymentMethod } from "@/lib/payments/methods";
import { revalidatePath } from "next/cache";

const MAX_SCRIPT_BYTES = 10 * 1024 * 1024;

export async function addLineItem(productId: string, quantity: number) {
  const { user } = await requireProvider();
  if (!Number.isFinite(quantity) || quantity < 1)
    return { error: "Invalid quantity" };

  const supabase = await createClient();
  const orderId = await getOrCreateDraftOrder(supabase, user.id);

  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("is_active", true)
    .single();

  if (pErr || !product) return { error: "Product unavailable" };

  const unit = product.price_cents as number;
  if (!Number.isFinite(unit) || unit <= 0) {
    return { error: "Pricing unavailable for this variant. Please contact Novecy CP KZN." };
  }
  const total = unit * quantity;
  const variantLabel = [product.strength, product.unit_size].filter(Boolean).join(" • ");
  const snapshot = variantLabel
    ? `${product.name as string} (${variantLabel})`
    : (product.name as string);

  const { data: existing } = await supabase
    .from("order_items")
    .select("id, quantity")
    .eq("order_id", orderId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing?.id) {
    const newQty = (existing.quantity as number) + quantity;
    const { error } = await supabase
      .from("order_items")
      .update({
        quantity: newQty,
        unit_price_cents: unit,
        total_price_cents: unit * newQty,
      })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("order_items").insert({
      order_id: orderId,
      product_id: productId,
      product_name_snapshot: snapshot,
      quantity,
      unit_price_cents: unit,
      total_price_cents: total,
    });
    if (error) return { error: error.message };
  }

  await recalcOrderTotals(supabase, orderId);
  await clearSignedScript(supabase, orderId);
  revalidatePath("/portal/cart");
  revalidatePath("/portal/products");
  return { ok: true as const };
}

export async function updateLineQuantity(itemId: string, quantity: number) {
  await requireProvider();
  if (!Number.isFinite(quantity) || quantity < 1) return { error: "Invalid quantity" };
  const supabase = await createClient();

  const { data: line } = await supabase
    .from("order_items")
    .select("order_id, unit_price_cents")
    .eq("id", itemId)
    .single();

  if (!line) return { error: "Line not found" };

  const unit = line.unit_price_cents as number;
  await supabase
    .from("order_items")
    .update({
      quantity,
      total_price_cents: unit * quantity,
    })
    .eq("id", itemId);

  await recalcOrderTotals(supabase, line.order_id as string);
  await clearSignedScript(supabase, line.order_id as string);
  revalidatePath("/portal/cart");
  return { ok: true as const };
}

export async function removeLineItem(itemId: string) {
  await requireProvider();
  const supabase = await createClient();
  const { data: line } = await supabase
    .from("order_items")
    .select("order_id")
    .eq("id", itemId)
    .single();
  if (!line) return { error: "Not found" };
  await supabase.from("order_items").delete().eq("id", itemId);
  await recalcOrderTotals(supabase, line.order_id as string);
  await clearSignedScript(supabase, line.order_id as string);
  revalidatePath("/portal/cart");
  return { ok: true as const };
}

export async function uploadSignedScript(
  orderId: string,
  formData: FormData,
): Promise<{ ok?: true; error?: string }> {
  const { user } = await requireProvider();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return { error: "Please choose a PDF file to upload." };
  }

  const upload = file as File;
  if (upload.size === 0) return { error: "File is empty." };
  if (upload.size > MAX_SCRIPT_BYTES) return { error: "File must be 10 MB or smaller." };

  const name = upload.name.toLowerCase();
  const isPdf =
    upload.type === "application/pdf" || name.endsWith(".pdf");
  if (!isPdf) {
    return { error: "Only PDF files are accepted for signed scripts." };
  }

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, provider_id")
    .eq("id", orderId)
    .eq("provider_id", user.id)
    .single();

  if (!order || order.status !== "draft") {
    return { error: "Invalid order." };
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("id")
    .eq("order_id", orderId)
    .limit(1);

  if (!items?.length) {
    return { error: "Add items to your cart before uploading a signed script." };
  }

  await clearSignedScript(supabase, orderId);

  const safeName = upload.name.replace(/[^\w.\-]/g, "_") || "signed-script.pdf";
  const path = `${orderId}/signed_${Date.now()}_${safeName}`;
  const buf = Buffer.from(await upload.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("order-scripts")
    .upload(path, buf, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (upErr) {
    console.error(upErr);
    return { error: "Upload failed. Please try again." };
  }

  const { error: updErr } = await supabase
    .from("orders")
    .update({
      signed_script_path: path,
      signed_script_file_name: upload.name,
      signed_script_uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updErr) {
    await supabase.storage.from("order-scripts").remove([path]);
    return { error: updErr.message };
  }

  revalidatePath("/portal/cart");
  return { ok: true as const };
}

export async function submitCheckout(formData: FormData) {
  const { user, profile } = await requireProvider();
  const supabase = await createClient();

  const orderId = String(formData.get("orderId") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "") as PaymentMethod;

  if (!orderId) {
    redirect("/portal/cart?error=Missing+order");
  }

  if (!["online", "eft", "on_account"].includes(paymentMethod)) {
    redirect("/portal/cart?error=Choose+a+payment+method");
  }

  const result = await finalizeCheckout(
    supabase,
    user.id,
    user.email,
    orderId,
    paymentMethod,
    {
      role: profile.role as string,
      email: profile.email as string | null,
      full_name: profile.full_name as string | null,
      phone: profile.phone as string | null,
      on_account_approved: profile.on_account_approved as boolean | null,
    },
  );

  if (result.type === "error") {
    redirect(`/portal/cart?error=${encodeURIComponent(result.message)}`);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/portal/orders");
  revalidatePath("/portal/cart");

  redirect(result.url);
}
