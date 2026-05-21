import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
import { formatPaymentMethod, formatPaymentStatus } from "@/lib/payments/methods";
import { markOrderPacked } from "../actions";
import { EftPaymentPanel } from "./eft-payment-panel";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
};

type ItemRow = {
  id: string;
  order_id: string;
  product_name_snapshot: string;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
};

type ApplicationRow = {
  applicant_user_id: string | null;
  address: string;
  city: string;
  province: string;
  status: string;
  reviewed_at: string | null;
  created_at: string | null;
};

export default async function AdminOrdersPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: orders, error: ordersErr } = await admin
    .from("orders")
    .select(
      "id, status, payment_status, payment_method, payment_provider, payment_reference, subtotal_cents, total_cents, created_at, provider_id, tracking_number, tracking_courier, tracking_url, packed_at, signed_script_path, signed_script_file_name, signed_script_uploaded_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const submittedOrders = (orders ?? []).filter((o) => o.status !== "draft");
  const draftOrders = (orders ?? []).filter((o) => o.status === "draft");

  const sortedOrders = [...submittedOrders].sort((a, b) => {
    const aEft = a.payment_method === "eft" && a.payment_status === "awaiting_eft" ? 1 : 0;
    const bEft = b.payment_method === "eft" && b.payment_status === "awaiting_eft" ? 1 : 0;
    if (aEft !== bEft) return bEft - aEft;
    return new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime();
  });

  const eftAwaitingCount = submittedOrders.filter(
    (o) => o.payment_method === "eft" && o.payment_status === "awaiting_eft",
  ).length;
  const eftPopCount = submittedOrders.filter(
    (o) => o.payment_method === "eft" && o.payment_status === "pop_received",
  ).length;

  const providerIds = [...new Set((orders ?? []).map((o) => o.provider_id as string))];
  const { data: profiles } = providerIds.length
    ? await admin
        .from("profiles")
        .select("id, email, full_name, company_name, phone")
        .in("id", providerIds)
    : { data: [] as ProfileRow[] };

  const orderIds = (orders ?? []).map((o) => o.id as string);
  const { data: items } = orderIds.length
    ? await admin
        .from("order_items")
        .select("id, order_id, product_name_snapshot, quantity, unit_price_cents, total_price_cents")
        .in("order_id", orderIds)
    : { data: [] as ItemRow[] };

  const { data: applications } = providerIds.length
    ? await admin
        .from("applications")
        .select("applicant_user_id, address, city, province, status, reviewed_at, created_at")
        .eq("status", "approved")
        .in("applicant_user_id", providerIds)
        .order("reviewed_at", { ascending: false })
    : { data: [] as ApplicationRow[] };

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  const itemsByOrder = new Map<string, ItemRow[]>();
  for (const row of items ?? []) {
    const list = itemsByOrder.get(row.order_id) ?? [];
    list.push(row);
    itemsByOrder.set(row.order_id, list);
  }

  const shippingByProvider = new Map<string, { address: string; city: string; province: string }>();
  for (const row of applications ?? []) {
    const key = row.applicant_user_id as string | null;
    if (!key || shippingByProvider.has(key)) continue;
    shippingByProvider.set(key, {
      address: row.address,
      city: row.city,
      province: row.province,
    });
  }

  function formatZar(cents: number) {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(cents / 100);
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-[#234467]">Orders tracking</h1>
      <p className="mt-2 text-sm text-[#6d6e71]">
        All submitted orders appear here automatically — including EFT orders awaiting proof of
        payment. Update EFT payment status when POP is emailed, then pack once paid.
      </p>
      {ordersErr ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          Could not load orders: {ordersErr.message}
        </p>
      ) : null}
      {(eftAwaitingCount > 0 || eftPopCount > 0) && (
        <p className="mt-3 rounded-xl border border-[#f5e6c8] bg-[#fffbeb] px-4 py-2 text-sm text-[#92400e]">
          <strong>{eftAwaitingCount}</strong> EFT order{eftAwaitingCount === 1 ? "" : "s"} awaiting
          POP
          {eftPopCount > 0 ? (
            <>
              {" "}
              · <strong>{eftPopCount}</strong> with POP received (verify &amp; mark paid)
            </>
          ) : null}
        </p>
      )}

      <div className="mt-8 space-y-6">
        {sortedOrders.map((o) => {
          const profile = profileMap[o.provider_id as string];
          const orderItems = itemsByOrder.get(o.id as string) ?? [];
          const shipping = shippingByProvider.get(o.provider_id as string);
          const orderId = String(o.id);
          const hasSignedScript = Boolean(o.signed_script_path && o.signed_script_uploaded_at);
          const scriptHref = `/api/admin/orders/${orderId}/signed-script`;
          const isEft = o.payment_method === "eft";
          const eftRef = orderId.slice(0, 8).toUpperCase();

          return (
            <section
              key={o.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm ${
                isEft && (o.payment_status === "awaiting_eft" || o.payment_status === "pop_received")
                  ? "border-[#f5e6c8] ring-1 ring-[#fde68a]"
                  : "border-[#e0dedf]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#eef0f1] pb-4">
                <div>
                  <p className="font-mono text-xs text-[#8c8d91]">Order {orderId}</p>
                  <h2 className="mt-1 text-lg font-semibold text-[#234467]">
                    {profile?.company_name ?? profile?.full_name ?? "Unknown professional"}
                  </h2>
                  <p className="text-sm text-[#6d6e71]">{profile?.email ?? "No email on profile"}</p>
                  {profile?.phone ? <p className="text-sm text-[#6d6e71]">Phone: {profile.phone}</p> : null}
                </div>
                <div className="space-y-2 text-right">
                  <p className="text-xs text-[#8c8d91]">
                    {o.created_at ? new Date(o.created_at).toLocaleString() : "—"}
                  </p>
                  <p className="text-xl font-semibold text-[#234467]">{formatZar(o.total_cents ?? 0)}</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <span className="rounded-full bg-[#e6f7fd] px-2.5 py-1 text-xs font-medium capitalize text-[#0077aa]">
                      {o.status}
                    </span>
                    <span className="rounded-full bg-[#f2f4f5] px-2.5 py-1 text-xs font-medium text-[#5c6b7a]">
                      {formatPaymentStatus(o.payment_status as string)}
                    </span>
                    {o.payment_method ? (
                      <span className="rounded-full bg-[#f0fdf4] px-2.5 py-1 text-xs font-medium text-[#166534]">
                        {formatPaymentMethod(o.payment_method as string)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#dce9f5] bg-[#f0f9fd] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-[#0077aa]">
                      Signed order script
                    </h3>
                    <p className="mt-1 text-xs text-[#6d6e71]">
                      Official signed PDF uploaded by the professional before checkout.
                    </p>
                  </div>
                  {hasSignedScript ? (
                    <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#166534]">
                      On file
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-semibold text-[#92400e]">
                      Missing
                    </span>
                  )}
                </div>
                {hasSignedScript ? (
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <a
                      href={scriptHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-full bg-[#00a4e4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0090c8]"
                    >
                      View signed script PDF
                    </a>
                    <div className="text-sm text-[#234467]">
                      <p className="font-medium">{(o.signed_script_file_name as string) ?? "signed-script.pdf"}</p>
                      <p className="text-xs text-[#6d6e71]">
                        Uploaded{" "}
                        {new Date(o.signed_script_uploaded_at as string).toLocaleString("en-ZA")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-amber-900">
                    No signed script attached. The professional must upload one in the cart before
                    payment, or this order predates that requirement.
                  </p>
                )}
              </div>

              {isEft ? (
                <EftPaymentPanel
                  orderId={orderId}
                  currentStatus={o.payment_status as string}
                  eftReference={eftRef}
                />
              ) : null}

              <div className="mt-4 grid gap-5 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#0077aa]">
                    Order items
                  </h3>
                  <ul className="mt-2 divide-y divide-[#eef0f1] rounded-xl border border-[#eef0f1]">
                    {orderItems.map((item) => (
                      <li key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                        <div>
                          <p className="font-medium text-[#234467]">{item.product_name_snapshot}</p>
                          <p className="text-xs text-[#8c8d91]">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-[#234467]">{formatZar(item.total_price_cents ?? 0)}</p>
                      </li>
                    ))}
                    {orderItems.length === 0 ? (
                      <li className="px-3 py-3 text-sm text-[#8c8d91]">No line items found for this order.</li>
                    ) : null}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#0077aa]">
                    Delivery details
                  </h3>
                  <div className="mt-2 rounded-xl border border-[#eef0f1] bg-[#f9fbfc] p-3 text-sm text-[#4a4a4a]">
                    {shipping ? (
                      <>
                        <p>{shipping.address}</p>
                        <p>
                          {shipping.city}, {shipping.province}
                        </p>
                      </>
                    ) : (
                      <p>Shipping address not found from approved application.</p>
                    )}
                    {o.payment_provider ? (
                      <p className="mt-2 text-xs text-[#6d6e71]">Payment provider: {o.payment_provider}</p>
                    ) : null}
                    {o.payment_reference ? (
                      <p className="text-xs text-[#6d6e71]">Payment ref: {o.payment_reference}</p>
                    ) : null}
                    <p className="mt-2 text-xs font-semibold text-[#0077aa]">Payment</p>
                    <p className="text-xs text-[#234467]">
                      {formatPaymentMethod(o.payment_method as string)} —{" "}
                      {formatPaymentStatus(o.payment_status as string)}
                    </p>
                    <p className="mt-2 text-xs text-[#6d6e71]">
                      Subtotal: {formatZar(o.subtotal_cents ?? 0)}
                    </p>
                  </div>
                </div>
              </div>

              <form action={markOrderPacked} className="mt-5 rounded-xl border border-[#e0dedf] bg-[#f9fbfc] p-4">
                <input type="hidden" name="orderId" value={orderId} />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#0077aa]">
                  Packing and tracking
                </h3>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <label className="text-xs font-medium text-[#6d6e71]">
                    Tracking number
                    <input
                      name="trackingNumber"
                      required
                      defaultValue={o.tracking_number ?? ""}
                      className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8]"
                    />
                  </label>
                  <label className="text-xs font-medium text-[#6d6e71]">
                    Courier
                    <input
                      name="courier"
                      defaultValue={o.tracking_courier ?? ""}
                      placeholder="e.g. The Courier Guy"
                      className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8]"
                    />
                  </label>
                  <label className="text-xs font-medium text-[#6d6e71]">
                    Tracking URL
                    <input
                      name="trackingUrl"
                      defaultValue={o.tracking_url ?? ""}
                      placeholder="https://..."
                      className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8]"
                    />
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-[#6d6e71]">
                    {o.packed_at
                      ? `Packed on ${new Date(o.packed_at).toLocaleString()}`
                      : "Not marked as packed yet."}
                  </p>
                  <button
                    type="submit"
                    className="rounded-full bg-[#00a4e4] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0090c8]"
                  >
                    Save tracking and email professional
                  </button>
                </div>
              </form>
            </section>
          );
        })}

        {sortedOrders.length === 0 && (
          <div className="rounded-2xl border border-[#e0dedf] bg-white p-8 text-center text-sm text-[#8c8d91] shadow-sm">
            No submitted orders yet.
            {draftOrders.length > 0 ? (
              <span className="mt-2 block text-amber-800">
                {draftOrders.length} draft cart{draftOrders.length === 1 ? "" : "s"} in progress
                below — submit EFT from the portal cart to move them here.
              </span>
            ) : null}
          </div>
        )}

        {draftOrders.length > 0 ? (
          <section className="mt-10 rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-900">
              Draft carts (not submitted)
            </h2>
            <p className="mt-1 text-xs text-amber-900/80">
              These are in-progress carts. They only appear in order tracking after the professional
              clicks Submit (EFT / online / on account).
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {draftOrders.slice(0, 10).map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap justify-between gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2"
                >
                  <span className="font-mono text-xs">{String(o.id).slice(0, 8)}…</span>
                  <span>{formatZar(o.total_cents ?? 0)}</span>
                  <span className="text-xs text-amber-800">draft</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
