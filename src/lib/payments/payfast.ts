import crypto from "crypto";
import type { PaymentCustomer, PaymentSessionResult, PaymentWebhookResult } from "./types";

function buildSignature(params: Record<string, string>, passphrase?: string) {
  const ordered = Object.keys(params)
    .filter((k) => k !== "signature")
    .sort()
    .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`)
    .join("&");
  const raw = ordered + `&passphrase=${encodeURIComponent(passphrase ?? "")}`;
  return crypto.createHash("md5").update(raw).digest("hex");
}

export async function createPayfastSession(
  orderId: string,
  amount: string,
  customer: PaymentCustomer,
): Promise<PaymentSessionResult> {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const returnUrl = process.env.PAYFAST_RETURN_URL;
  const cancelUrl = process.env.PAYFAST_CANCEL_URL;
  const notifyUrl = process.env.PAYFAST_NOTIFY_URL;
  const passphrase = process.env.PAYFAST_PASSPHRASE;

  if (!merchantId || !merchantKey || !returnUrl || !notifyUrl) {
    throw new Error("PayFast environment variables are not configured.");
  }

  const params: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: returnUrl,
    cancel_url: cancelUrl ?? returnUrl,
    notify_url: notifyUrl,
    name_first: customer.name.split(/\s+/)[0] ?? customer.name,
    name_last: customer.name.split(/\s+/).slice(1).join(" ") || "—",
    email_address: customer.email,
    cell_number: customer.phone ?? "",
    m_payment_id: orderId,
    amount,
    item_name: `Order ${orderId.slice(0, 8)}`,
  };

  params.signature = buildSignature(params, passphrase);

  const host =
    process.env.PAYFAST_HOST ?? "https://www.payfast.co.za/eng/process";

  return {
    redirectUrl: `${host}?${new URLSearchParams(params).toString()}`,
    externalId: orderId,
  };
}

/**
 * PayFast ITN — typically application/x-www-form-urlencoded body.
 */
export async function verifyPayfastItn(
  body: unknown,
): Promise<PaymentWebhookResult> {
  let data: Record<string, string> = {};
  if (typeof body === "string") {
    const sp = new URLSearchParams(body);
    sp.forEach((v, k) => {
      data[k] = v;
    });
  } else if (body && typeof body === "object" && !(body instanceof FormData)) {
    data = body as Record<string, string>;
  }

  const passphrase = process.env.PAYFAST_PASSPHRASE ?? "";

  const signature = data.signature;
  const computed = buildSignature(
    Object.fromEntries(Object.entries(data).filter(([k]) => k !== "signature")),
    passphrase,
  );

  const orderId = data.m_payment_id ?? "";
  const amount = data.amount_gross ?? data.amount;
  const paymentStatus = (data.payment_status ?? "").toLowerCase();

  const verified = !!signature && signature === computed;

  let status: PaymentWebhookResult["status"] = "pending";
  if (paymentStatus === "complete") status = "paid";
  else if (paymentStatus === "failed") status = "failed";
  else if (paymentStatus === "cancelled") status = "cancelled";

  const amountCents = amount ? Math.round(parseFloat(amount) * 100) : undefined;

  return {
    verified,
    orderId: orderId || undefined,
    externalPaymentId: data.pf_payment_id,
    amountCents,
    currency: "ZAR",
    status,
    rawPayload: data as Record<string, unknown>,
  };
}
