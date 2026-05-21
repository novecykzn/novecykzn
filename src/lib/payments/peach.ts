import crypto from "crypto";
import type { PaymentCustomer, PaymentSessionResult, PaymentWebhookResult } from "./types";

/**
 * Peach Payments Checkout — session creation via REST (simplified).
 * Configure entity ID, bearer token, and webhook secret in env.
 */
export async function createPeachSession(
  orderId: string,
  amount: string,
  customer: PaymentCustomer,
): Promise<PaymentSessionResult> {
  const entityId = process.env.PEACH_ENTITY_ID;
  const token = process.env.PEACH_ACCESS_TOKEN;
  const returnUrl = process.env.PEACH_RETURN_URL;
  if (!entityId || !token || !returnUrl) {
    throw new Error("Peach Payments environment variables are not configured.");
  }

  const baseUrl =
    process.env.PEACH_API_BASE ?? "https://testsecure.peachpayments.com";
  const res = await fetch(`${baseUrl}/checkout/v2/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      entityId,
      amount,
      currency: "ZAR",
      paymentType: "DB",
      merchantTransactionId: orderId,
      customer: {
        email: customer.email,
        givenName: customer.name.split(/\s+/)[0],
        surname: customer.name.split(/\s+/).slice(1).join(" ") || "—",
      },
      shopperResultUrl: returnUrl,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    id?: string;
    redirectUrl?: string;
    result?: { code?: string };
  };

  const redirectUrl =
    json.redirectUrl ??
    (json.id ? `${baseUrl}/checkout/v2/show?id=${encodeURIComponent(json.id)}` : "");

  if (!redirectUrl) {
    throw new Error(
      `Peach session creation failed: ${JSON.stringify(json).slice(0, 200)}`,
    );
  }

  return { redirectUrl, externalId: json.id };
}

export async function verifyPeachWebhook(
  body: unknown,
  headers: Headers,
): Promise<PaymentWebhookResult> {
  const secret = process.env.PEACH_WEBHOOK_SECRET ?? "";
  const sig = headers.get("x-peach-signature") ?? headers.get("x-signature") ?? "";

  let payload: Record<string, unknown> = {};
  if (typeof body === "string") {
    try {
      payload = JSON.parse(body) as Record<string, unknown>;
    } catch {
      payload = {};
    }
  } else if (body && typeof body === "object") {
    payload = body as Record<string, unknown>;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(typeof body === "string" ? body : JSON.stringify(payload))
    .digest("hex");

  const verified = !!secret && sig === expected;

  const id = String(payload["merchantTransactionId"] ?? payload["merchant_transaction_id"] ?? "");
  const amount = payload["amount"] as string | number | undefined;
  const statusRaw = String(payload["result"] ?? payload["paymentType"] ?? "").toLowerCase();

  let status: PaymentWebhookResult["status"] = "pending";
  if (statusRaw.includes("ok") || statusRaw === "success" || payload["result.code"] === "000.000.000") {
    status = "paid";
  } else if (statusRaw.includes("fail")) {
    status = "failed";
  }

  const amountCents =
    typeof amount === "number"
      ? Math.round(amount * 100)
      : amount
        ? Math.round(parseFloat(String(amount).replace(",", ".")) * 100)
        : undefined;

  return {
    verified,
    orderId: id || undefined,
    externalPaymentId: String(payload["id"] ?? ""),
    amountCents,
    currency: "ZAR",
    status,
    rawPayload: payload,
  };
}
