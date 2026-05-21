import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EftInstructionsPanel } from "@/components/eft-instructions-panel";
import { createClient } from "@/lib/supabase/server";
import { requireProvider } from "@/lib/auth/session";
import { getProviderOrderDetails } from "@/lib/orders/provider-details";
import { getEftBankDetails, getOrderContactEmail } from "@/lib/payments/methods";

function formatZar(cents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(cents / 100);
}

export default async function CheckoutEftPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  if (!orderId) redirect("/portal/cart");

  const { user } = await requireProvider();
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, total_cents, payment_method, payment_status, status, provider_id")
    .eq("id", orderId)
    .eq("provider_id", user.id)
    .single();

  if (!order || order.payment_method !== "eft") notFound();

  const bank = getEftBankDetails();
  const contactEmail = getOrderContactEmail();
  const provider = await getProviderOrderDetails(supabase, user.id, user.email);
  const addressLine = provider
    ? [provider.address, provider.city, provider.province].filter((p) => p && p !== "—").join(", ")
    : null;
  const reference = String(order.id).slice(0, 8).toUpperCase();

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#166534]">Order received</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#234467]">Thank you for your order</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#335d1f]">
          Your order has been submitted and is now visible on our order tracker.{" "}
          <strong>Our team will await your proof of payment (POP) before starting your order.</strong>{" "}
          Once we receive and verify your POP, we will update payment status and begin packing.
        </p>
        <p className="mt-3 font-mono text-sm text-[#0077aa]">
          Order reference: <strong>{reference}</strong>
        </p>
      </div>

      <p className="mt-6 text-sm text-[#6d6e71]">
        Please complete your EFT and email your POP using the details below.
      </p>

      <div className="mt-4">
        <EftInstructionsPanel
          orderReference={reference}
          totalZar={formatZar(order.total_cents ?? 0)}
          contactEmail={contactEmail}
          addressLine={addressLine}
          bank={{
            bankName: bank.bankName,
            accountName: bank.accountName,
            accountNumber: bank.accountNumber,
            branchCode: bank.branchCode,
            accountType: bank.accountType,
          }}
          showPlaceholdersNote={bank.usingPlaceholders}
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/portal/orders"
          className="rounded-full bg-[#00a4e4] px-4 py-2 text-sm font-semibold text-white"
        >
          View order history
        </Link>
        <Link href="/portal/products" className="text-sm font-medium text-[#00a4e4] underline">
          Place another order
        </Link>
      </div>
    </div>
  );
}
