import { NextResponse } from "next/server";
import {
  verifyPaymentWebhook,
  updateOrderPaymentStatus,
} from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPaymentConfirmation } from "@/lib/email/resend";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let body: unknown;

  if (contentType.includes("application/json")) {
    body = await request.json().catch(() => ({}));
  } else {
    const text = await request.text();
    body = text;
  }

  const result = await verifyPaymentWebhook(body, request.headers);

  if (!result.verified) {
    return NextResponse.json({ ok: false, reason: "unverified" }, { status: 400 });
  }

  const orderId = result.orderId;
  if (!orderId) {
    return NextResponse.json({ ok: false, reason: "no_order" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).single();

  if (!order) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const providerId = order.provider_id as string;

  if (result.status === "paid") {
    await updateOrderPaymentStatus(orderId, "paid");

    await admin.from("payments").insert({
      order_id: orderId,
      provider_id: providerId,
      provider_name: null,
      payment_provider: order.payment_provider ?? "unknown",
      external_payment_id: result.externalPaymentId ?? null,
      amount_cents: result.amountCents ?? order.total_cents,
      currency: result.currency ?? "ZAR",
      status: "paid",
      raw_payload: result.rawPayload,
    });

    const { data: prof } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", providerId)
      .single();

    if (prof?.email) {
      await sendPaymentConfirmation({
        email: prof.email as string,
        orderId,
        amountZar: new Intl.NumberFormat("en-ZA", {
          style: "currency",
          currency: "ZAR",
        }).format(((result.amountCents ?? order.total_cents) as number) / 100),
      });
    }
  } else if (result.status === "failed") {
    await updateOrderPaymentStatus(orderId, "failed");
  } else if (result.status === "cancelled") {
    await updateOrderPaymentStatus(orderId, "cancelled");
  }

  return NextResponse.json({ ok: true });
}
