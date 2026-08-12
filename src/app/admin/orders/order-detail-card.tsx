import { formatPaymentMethod, formatPaymentStatus } from "@/lib/payments/methods";
import { markOrderPacked } from "../actions";
import { EftPaymentPanel } from "./eft-payment-panel";

export type OrderDetailProfile = {
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
};

export type OrderDetailItem = {
  id: string;
  product_name_snapshot: string;
  quantity: number;
  total_price_cents: number;
};

export type OrderDetailShipping = {
  address: string;
  city: string;
  province: string;
};

export type OrderDetailRecord = {
  id: string;
  status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  subtotal_cents: number | null;
  total_cents: number | null;
  created_at: string | null;
  tracking_number: string | null;
  tracking_courier: string | null;
  tracking_url: string | null;
  packed_at: string | null;
  signed_script_path: string | null;
  signed_script_file_name: string | null;
  signed_script_uploaded_at: string | null;
};

export function formatZar(cents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(cents / 100);
}

export function OrderDetailCard({
  order,
  profile,
  items,
  shipping,
}: {
  order: OrderDetailRecord;
  profile: OrderDetailProfile | undefined;
  items: OrderDetailItem[];
  shipping: OrderDetailShipping | undefined;
}) {
  const orderId = String(order.id);
  const hasSignedScript = Boolean(order.signed_script_path && order.signed_script_uploaded_at);
  const scriptHref = `/api/admin/orders/${orderId}/signed-script`;
  const isEft = order.payment_method === "eft";
  const eftRef = orderId.slice(0, 8).toUpperCase();

  return (
    <section
      className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${
        isEft && (order.payment_status === "awaiting_eft" || order.payment_status === "pop_received")
          ? "border-[#f5e6c8] ring-1 ring-[#fde68a]"
          : "border-[#e0dedf]"
      }`}
    >
      <div className="flex flex-col gap-4 border-b border-[#eef0f1] pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-all font-mono text-xs text-[#8c8d91]">Order {orderId}</p>
          <h2 className="mt-1 text-lg font-semibold text-[#234467]">
            {profile?.company_name ?? profile?.full_name ?? "Unknown professional"}
          </h2>
          <p className="text-sm text-[#6d6e71]">{profile?.email ?? "No email on profile"}</p>
          {profile?.phone ? <p className="text-sm text-[#6d6e71]">Phone: {profile.phone}</p> : null}
        </div>
        <div className="space-y-2 sm:text-right">
          <p className="text-xs text-[#8c8d91]">
            {order.created_at ? new Date(order.created_at).toLocaleString() : "—"}
          </p>
          <p className="text-xl font-semibold text-[#234467]">{formatZar(order.total_cents ?? 0)}</p>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full bg-[#e6f7fd] px-2.5 py-1 text-xs font-medium capitalize text-[#0077aa]">
              {order.status}
            </span>
            <span className="rounded-full bg-[#f2f4f5] px-2.5 py-1 text-xs font-medium text-[#5c6b7a]">
              {formatPaymentStatus(order.payment_status)}
            </span>
            {order.payment_method ? (
              <span className="rounded-full bg-[#f0fdf4] px-2.5 py-1 text-xs font-medium text-[#166534]">
                {formatPaymentMethod(order.payment_method)}
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
              className="inline-flex w-full items-center justify-center rounded-full bg-[#00a4e4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0090c8] sm:w-auto"
            >
              View signed script PDF
            </a>
            <div className="text-sm text-[#234467]">
              <p className="font-medium">{order.signed_script_file_name ?? "signed-script.pdf"}</p>
              <p className="text-xs text-[#6d6e71]">
                Uploaded {new Date(order.signed_script_uploaded_at as string).toLocaleString("en-ZA")}
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
          currentStatus={order.payment_status as string}
          eftReference={eftRef}
        />
      ) : null}

      <div className="mt-4 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#0077aa]">
            Order items
          </h3>
          <ul className="mt-2 divide-y divide-[#eef0f1] rounded-xl border border-[#eef0f1]">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-[#234467]">{item.product_name_snapshot}</p>
                  <p className="text-xs text-[#8c8d91]">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium text-[#234467]">{formatZar(item.total_price_cents ?? 0)}</p>
              </li>
            ))}
            {items.length === 0 ? (
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
            {order.payment_provider ? (
              <p className="mt-2 text-xs text-[#6d6e71]">Payment provider: {order.payment_provider}</p>
            ) : null}
            {order.payment_reference ? (
              <p className="text-xs text-[#6d6e71]">Payment ref: {order.payment_reference}</p>
            ) : null}
            <p className="mt-2 text-xs font-semibold text-[#0077aa]">Payment</p>
            <p className="text-xs text-[#234467]">
              {formatPaymentMethod(order.payment_method)} — {formatPaymentStatus(order.payment_status)}
            </p>
            <p className="mt-2 text-xs text-[#6d6e71]">Subtotal: {formatZar(order.subtotal_cents ?? 0)}</p>
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
              defaultValue={order.tracking_number ?? ""}
              className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8]"
            />
          </label>
          <label className="text-xs font-medium text-[#6d6e71]">
            Courier
            <input
              name="courier"
              defaultValue={order.tracking_courier ?? ""}
              placeholder="e.g. The Courier Guy"
              className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8]"
            />
          </label>
          <label className="text-xs font-medium text-[#6d6e71]">
            Tracking URL
            <input
              name="trackingUrl"
              defaultValue={order.tracking_url ?? ""}
              placeholder="https://..."
              className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8]"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-xs text-[#6d6e71]">
            {order.packed_at
              ? `Packed on ${new Date(order.packed_at).toLocaleString()}`
              : "Not marked as packed yet."}
          </p>
          <button
            type="submit"
            className="w-full rounded-full bg-[#00a4e4] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0090c8] sm:w-auto"
          >
            Save tracking and email professional
          </button>
        </div>
      </form>
    </section>
  );
}
