import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShippingAddressNotice } from "@/components/shipping-address-notice";
import { requireProvider } from "@/lib/auth/session";
import { getProviderOrderDetails } from "@/lib/orders/provider-details";
import { getOrderContactEmail } from "@/lib/payments/methods";

function formatZar(cents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(cents / 100);
}

export default async function CheckoutOnAccountPage({
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

  if (!order || order.payment_method !== "on_account") notFound();

  const contactEmail = getOrderContactEmail();
  const provider = await getProviderOrderDetails(supabase, user.id, user.email);
  const addressLine = provider
    ? [provider.address, provider.city, provider.province].filter((p) => p && p !== "—").join(", ")
    : null;

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[#dce9c9] bg-[#fbfdf6] p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5f8f37]">On account</p>
      <h1 className="mt-2 text-2xl font-semibold text-[#234467]">Order submitted</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#6d6e71]">
        Your order for{" "}
        <strong className="text-[#234467]">{formatZar(order.total_cents ?? 0)}</strong> has been
        placed on your approved account. Our team will process it according to your agreement
        with Novecy CP KZN.
      </p>
      <p className="mt-3 font-mono text-xs text-[#8c8d91]">Reference: {String(order.id)}</p>

      <div className="mt-6 rounded-xl border border-[#e0dedf] bg-white/80 px-4 py-4">
        <ShippingAddressNotice contactEmail={contactEmail} addressLine={addressLine} />
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/portal/orders"
          className="rounded-full bg-[#00a4e4] px-4 py-2 text-sm font-semibold text-white"
        >
          View orders
        </Link>
        <Link href="/portal" className="text-sm font-medium text-[#00a4e4] underline">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
