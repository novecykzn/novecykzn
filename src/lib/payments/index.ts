import type { PaymentCustomer, PaymentSessionResult, PaymentWebhookResult } from "./types";
import { createPayfastSession, verifyPayfastItn } from "./payfast";
import { createPeachSession, verifyPeachWebhook } from "./peach";

function providerId(): "payfast" | "peach" {
  const p = process.env.PAYMENT_PROVIDER?.toLowerCase();
  if (p === "peach") return "peach";
  return "payfast";
}

export async function createPaymentSession(
  orderId: string,
  amountCents: number,
  customer: PaymentCustomer,
): Promise<PaymentSessionResult> {
  const amount = (amountCents / 100).toFixed(2);
  if (providerId() === "peach") {
    return createPeachSession(orderId, amount, customer);
  }
  return createPayfastSession(orderId, amount, customer);
}

export async function verifyPaymentWebhook(
  body: unknown,
  headers: Headers,
): Promise<PaymentWebhookResult> {
  if (providerId() === "peach") {
    return verifyPeachWebhook(body, headers);
  }
  return verifyPayfastItn(body);
}

/**
 * Updates order after verified webhook only. Uses service role.
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: "paid" | "failed" | "cancelled" | "pending_payment" | "refunded",
) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const updates: Record<string, string | null> = {
    updated_at: new Date().toISOString(),
  };

  if (paymentStatus === "paid") {
    updates.payment_status = "paid";
    updates.status = "paid";
  } else if (paymentStatus === "failed") {
    updates.payment_status = "failed";
    updates.status = "pending_payment";
  } else if (paymentStatus === "cancelled") {
    updates.payment_status = "cancelled";
    updates.status = "cancelled";
  } else if (paymentStatus === "refunded") {
    updates.payment_status = "refunded";
    updates.status = "processing";
  } else {
    updates.payment_status = "pending_payment";
  }

  const { error } = await admin.from("orders").update(updates).eq("id", orderId);
  if (error) throw error;
  return { ok: true as const };
}
