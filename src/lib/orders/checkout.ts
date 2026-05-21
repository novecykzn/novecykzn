import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPaymentSession } from "@/lib/payments";
import type { PaymentMethod } from "@/lib/payments/methods";
import { getOrderContactEmail } from "@/lib/payments/methods";
import {
  sendEftOrderConfirmation,
  sendOnAccountOrderConfirmation,
  sendOrderConfirmation,
} from "@/lib/email/resend";
import { orderHasSignedScript } from "@/lib/orders/signed-script";

function formatZar(cents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(cents / 100);
}

export type CheckoutResult =
  | { type: "redirect"; url: string }
  | { type: "error"; message: string };

export async function finalizeCheckout(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string | undefined,
  orderId: string,
  paymentMethod: PaymentMethod,
  profile: {
    role: string;
    email: string | null;
    full_name: string | null;
    phone: string | null;
    on_account_approved?: boolean | null;
  },
): Promise<CheckoutResult> {
  if (profile.role !== "provider") {
    return { type: "error", message: "Professional access required." };
  }

  if (paymentMethod === "on_account" && !profile.on_account_approved) {
    return { type: "error", message: "On-account payment is not enabled for your practice." };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("provider_id", userId)
    .single();

  if (!order || order.status !== "draft") {
    return { type: "error", message: "Invalid or already submitted order." };
  }

  const total = order.total_cents as number;
  if (total <= 0) {
    return { type: "error", message: "Nothing to pay." };
  }

  if (!orderHasSignedScript(order)) {
    return {
      type: "error",
      message: "Upload a signed order script PDF before submitting.",
    };
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const toEmail = (profile.email as string) || userEmail;
  const totalZar = formatZar(total);

  if (paymentMethod === "online") {
    const paymentProvider =
      process.env.PAYMENT_PROVIDER?.toLowerCase() === "peach" ? "peach" : "payfast";

    const { data: updated, error: updErr } = await admin
      .from("orders")
      .update({
        status: "pending_payment",
        payment_status: "pending_payment",
        payment_method: "online",
        payment_provider: paymentProvider,
        updated_at: now,
      })
      .eq("id", orderId)
      .eq("provider_id", userId)
      .eq("status", "draft")
      .select("id")
      .maybeSingle();

    if (updErr || !updated?.id) {
      console.error("[checkout] online update", updErr);
      return { type: "error", message: "Could not submit order. Please try again." };
    }

    const session = await createPaymentSession(orderId, total, {
      email: toEmail || "",
      name: (profile.full_name as string) || "Provider",
      phone: (profile.phone as string) || undefined,
    });

    if (toEmail) {
      try {
        await sendOrderConfirmation({ email: toEmail, orderId, totalZar });
      } catch {
        /* non-fatal */
      }
    }

    return { type: "redirect", url: session.redirectUrl };
  }

  if (paymentMethod === "eft") {
    const { data: updated, error: updErr } = await admin
      .from("orders")
      .update({
        status: "pending_payment",
        payment_status: "awaiting_eft",
        payment_method: "eft",
        payment_provider: "eft",
        updated_at: now,
      })
      .eq("id", orderId)
      .eq("provider_id", userId)
      .eq("status", "draft")
      .select("id")
      .maybeSingle();

    if (updErr) {
      console.error("[checkout] eft update", updErr);
      return {
        type: "error",
        message:
          "Database setup required: open Supabase → SQL Editor, run the full script in supabase/RUN_IN_SUPABASE.sql, then try again.",
      };
    }

    if (!updated?.id) {
      return {
        type: "error",
        message:
          "This order was already submitted or could not be saved. Add items and submit again from the cart.",
      };
    }

    if (toEmail) {
      try {
        await sendEftOrderConfirmation({
          email: toEmail,
          orderId,
          totalZar,
          reference: orderId.slice(0, 8).toUpperCase(),
          popEmail: getOrderContactEmail(),
        });
      } catch {
        /* non-fatal */
      }
    }

    return { type: "redirect", url: `/portal/checkout/eft?orderId=${orderId}` };
  }

  const { data: updated, error: updErr } = await admin
    .from("orders")
    .update({
      status: "processing",
      payment_status: "on_account",
      payment_method: "on_account",
      payment_provider: "on_account",
      updated_at: now,
    })
    .eq("id", orderId)
    .eq("provider_id", userId)
    .eq("status", "draft")
    .select("id")
    .maybeSingle();

  if (updErr || !updated?.id) {
    console.error("[checkout] on_account update", updErr);
    return { type: "error", message: "Could not submit order. Please try again." };
  }

  if (toEmail) {
    try {
      await sendOnAccountOrderConfirmation({ email: toEmail, orderId, totalZar });
    } catch {
      /* non-fatal */
    }
  }

  return { type: "redirect", url: `/portal/checkout/on-account?orderId=${orderId}` };
}
