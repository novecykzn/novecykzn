import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProvider } from "@/lib/auth/session";
import { getOrCreateDraftOrder } from "@/lib/orders/draft";
import { CartClient } from "./cart-client";
import { CartScriptPanel } from "./cart-script-panel";
import { CartCheckout } from "./cart-checkout";
import { ShippingAddressNotice } from "@/components/shipping-address-notice";
import { getProviderOrderDetails } from "@/lib/orders/provider-details";
import { getEftBankDetails, getOrderContactEmail } from "@/lib/payments/methods";
import { orderHasSignedScript } from "@/lib/orders/signed-script";

function formatZar(cents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(cents / 100);
}

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const { user, profile } = await requireProvider();
  const supabase = await createClient();
  const onAccountApproved = Boolean(profile.on_account_approved);
  const orderId = await getOrCreateDraftOrder(supabase, user.id);

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  const hasItems = (items?.length ?? 0) > 0;
  const canCheckout = hasItems && orderHasSignedScript(order ?? {});
  const contactEmail = getOrderContactEmail();
  const bank = getEftBankDetails();
  const totalZar = formatZar(order?.total_cents ?? 0);
  const providerDetails = await getProviderOrderDetails(supabase, user.id, user.email);
  const addressLine = providerDetails
    ? [providerDetails.address, providerDetails.city, providerDetails.province]
        .filter((p) => p && p !== "—")
        .join(", ")
    : null;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5f8f37]">Novecy CP KZN</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#234467] sm:text-3xl">Cart</h1>
      <p className="mt-2 text-sm text-[#6d6e71]">
        Review your order, upload a signed script, then choose how you would like to pay.
      </p>

      {sp.error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {sp.error}
        </p>
      ) : null}

      {!hasItems ? (
        <p className="mt-8 text-sm text-[#8c8d91]">
          No lines yet.{" "}
          <Link href="/portal/products" className="text-[#00a4e4] underline">
            Browse catalogue
          </Link>
        </p>
      ) : (
        <>
          <CartClient
            items={(items ?? []).map((i) => ({
              id: i.id,
              name: i.product_name_snapshot,
              quantity: i.quantity,
              unit: i.unit_price_cents,
              total: i.total_price_cents,
            }))}
          />
          <CartScriptPanel
            orderId={orderId}
            signedFileName={(order?.signed_script_file_name as string) ?? null}
            signedUploadedAt={(order?.signed_script_uploaded_at as string) ?? null}
          />
          <div className="mt-6 rounded-xl border border-[#e0dedf] bg-[#f9fbfc] px-4 py-4">
            <ShippingAddressNotice contactEmail={contactEmail} addressLine={addressLine} />
          </div>
          <div className="mt-8 border-t border-[#e0dedf] pt-6">
            <p className="text-base font-semibold text-[#234467] sm:text-lg">
              Estimated total {formatZar(order?.total_cents ?? 0)}{" "}
              <span className="text-sm font-normal text-[#6d6e71]">
                incl. ex VAT per your contract
              </span>
            </p>
            {canCheckout ? (
              <CartCheckout
                orderId={orderId}
                onAccountAvailable={onAccountApproved}
                totalZar={totalZar}
                contactEmail={contactEmail}
                addressLine={addressLine}
                bank={{
                  bankName: bank.bankName,
                  accountName: bank.accountName,
                  accountNumber: bank.accountNumber,
                  branchCode: bank.branchCode,
                  accountType: bank.accountType,
                }}
                bankUsingPlaceholders={bank.usingPlaceholders}
              />
            ) : (
              <p className="mt-4 text-sm text-amber-900">
                Upload a signed order PDF above before choosing a payment method.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
