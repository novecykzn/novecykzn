export type PaymentMethod = "online" | "eft" | "on_account";

export const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  description: string;
}[] = [
  {
    id: "online",
    label: "Online payment",
    description: "Pay now by card via our secure payment gateway (PayFast / Peach).",
  },
  {
    id: "eft",
    label: "EFT / bank transfer",
    description: "Pay by EFT using our banking details. Order is processed once payment clears.",
  },
  {
    id: "on_account",
    label: "On account",
    description: "Charge to your approved practice account. Invoiced per your agreement with Novecy CP KZN.",
  },
];

export function getEftBankDetails() {
  const bankName = process.env.EFT_BANK_NAME?.trim();
  const accountNumber = process.env.EFT_ACCOUNT_NUMBER?.trim();
  const branchCode = process.env.EFT_BRANCH_CODE?.trim();

  return {
    bankName: bankName || "First National Bank (placeholder)",
    accountName: process.env.EFT_ACCOUNT_NAME?.trim() || "Novecy CP KZN (Pty) Ltd",
    accountNumber: accountNumber || "62812345678",
    branchCode: branchCode || "250655",
    accountType: process.env.EFT_ACCOUNT_TYPE?.trim() || "Current / Cheque",
    usingPlaceholders: !bankName || !accountNumber || !branchCode,
  };
}

/** Orders inbox — POP, shipping address changes, and order queries. */
export function getOrderContactEmail() {
  return (
    process.env.EFT_POP_EMAIL?.trim() ||
    process.env.ORDERS_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    "orders@novecy.co.za"
  );
}

/** @deprecated Use getOrderContactEmail */
export function getEftPopEmail() {
  return getOrderContactEmail();
}

export type EftPaymentStatus = "awaiting_eft" | "pop_received" | "paid" | "cancelled";

export const EFT_PAYMENT_STATUS_OPTIONS: { value: EftPaymentStatus; label: string }[] = [
  { value: "awaiting_eft", label: "Awaiting EFT / POP" },
  { value: "pop_received", label: "POP received (email)" },
  { value: "paid", label: "Paid — ready to pack" },
  { value: "cancelled", label: "Cancelled" },
];

export function formatPaymentMethod(method: string | null | undefined) {
  switch (method) {
    case "online":
      return "Online payment";
    case "eft":
      return "EFT / bank transfer";
    case "on_account":
      return "On account";
    default:
      return method ?? "—";
  }
}

export function formatPaymentStatus(status: string | null | undefined) {
  switch (status) {
    case "pending_payment":
      return "Pending payment";
    case "awaiting_eft":
      return "Awaiting EFT / POP";
    case "pop_received":
      return "POP received";
    case "on_account":
      return "On account";
    case "paid":
      return "Paid";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    case "refunded":
      return "Refunded";
    default:
      return status ?? "—";
  }
}
