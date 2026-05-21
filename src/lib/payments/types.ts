export type PaymentCustomer = {
  email: string;
  name: string;
  phone?: string | null;
};

export type PaymentSessionResult = {
  redirectUrl: string;
  externalId?: string;
};

export type PaymentWebhookResult = {
  verified: boolean;
  orderId?: string;
  externalPaymentId?: string;
  amountCents?: number;
  currency?: string;
  status: "paid" | "failed" | "cancelled" | "pending";
  rawPayload?: Record<string, unknown>;
};
