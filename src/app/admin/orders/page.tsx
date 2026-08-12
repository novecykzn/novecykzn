import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { formatPaymentMethod, formatPaymentStatus } from "@/lib/payments/methods";
import { formatZar } from "./order-detail-card";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
};

export default async function AdminOrdersPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: orders, error: ordersErr } = await admin
    .from("orders")
    .select("id, status, payment_status, payment_method, total_cents, created_at, provider_id")
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
        .select("id, email, full_name, company_name")
        .in("id", providerIds)
    : { data: [] as ProfileRow[] };

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[#234467] sm:text-3xl">Orders tracking</h1>
      <p className="mt-2 text-sm text-[#6d6e71]">
        All submitted orders appear here automatically — including EFT orders awaiting proof of
        payment. Open an order to update EFT status, then pack once paid.
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

      <div className="mt-6 space-y-3 md:hidden">
        {sortedOrders.map((o) => {
          const profile = profileMap[o.provider_id as string];
          const orderId = String(o.id);
          const needsAttention =
            o.payment_method === "eft" &&
            (o.payment_status === "awaiting_eft" || o.payment_status === "pop_received");

          return (
            <article
              key={orderId}
              className={`rounded-2xl border bg-white p-4 shadow-sm ${
                needsAttention ? "border-[#f5e6c8] ring-1 ring-[#fde68a]" : "border-[#e0dedf]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[#234467]">
                    {profile?.company_name ?? profile?.full_name ?? "Unknown professional"}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-[#6d6e71]">
                    {profile?.email ?? "No email on profile"}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#8c8d91]">{orderId.slice(0, 8)}…</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-[#234467]">
                  {formatZar(o.total_cents ?? 0)}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
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
              <p className="mt-3 text-xs text-[#8c8d91]">
                {o.created_at ? new Date(o.created_at).toLocaleString() : "—"}
              </p>
              <Link
                href={`/admin/orders/${orderId}`}
                className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#00a4e4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0090c8]"
              >
                View order
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-[#e0dedf] bg-white shadow-sm md:block md:mt-8">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#e0dedf] bg-[#f7f9fb] text-xs font-semibold uppercase tracking-wide text-[#6d6e71]">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((o) => {
              const profile = profileMap[o.provider_id as string];
              const orderId = String(o.id);
              const needsAttention =
                o.payment_method === "eft" &&
                (o.payment_status === "awaiting_eft" || o.payment_status === "pop_received");

              return (
                <tr
                  key={orderId}
                  className={`border-b border-[#eef0f1] last:border-0 hover:bg-[#f7f9fb] ${
                    needsAttention ? "bg-[#fffbeb] hover:bg-[#fef6e0]" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${orderId}`}
                      className="font-medium text-[#234467] hover:text-[#00a4e4]"
                    >
                      {profile?.company_name ?? profile?.full_name ?? "Unknown professional"}
                    </Link>
                    <p className="text-xs text-[#6d6e71]">{profile?.email ?? "No email on profile"}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#234467]">{orderId.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#e6f7fd] px-2.5 py-1 text-xs font-medium capitalize text-[#0077aa]">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="rounded-full bg-[#f2f4f5] px-2.5 py-1 text-xs font-medium text-[#5c6b7a]">
                        {formatPaymentStatus(o.payment_status as string)}
                      </span>
                      {o.payment_method ? (
                        <span className="text-xs text-[#6d6e71]">
                          {formatPaymentMethod(o.payment_method as string)}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#234467]">{formatZar(o.total_cents ?? 0)}</td>
                  <td className="px-4 py-3 text-[#8c8d91]">
                    {o.created_at ? new Date(o.created_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${orderId}`}
                      className="font-medium text-[#00a4e4] hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sortedOrders.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#8c8d91]">
            No submitted orders yet.
            {draftOrders.length > 0 ? (
              <span className="mt-2 block text-amber-800">
                {draftOrders.length} draft cart{draftOrders.length === 1 ? "" : "s"} in progress
                below — submit EFT from the portal cart to move them here.
              </span>
            ) : null}
          </p>
        )}
      </div>

      {sortedOrders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[#e0dedf] bg-white p-8 text-center text-sm text-[#8c8d91] shadow-sm md:hidden">
          No submitted orders yet.
          {draftOrders.length > 0 ? (
            <span className="mt-2 block text-amber-800">
              {draftOrders.length} draft cart{draftOrders.length === 1 ? "" : "s"} in progress
              below — submit EFT from the portal cart to move them here.
            </span>
          ) : null}
        </div>
      ) : null}

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
  );
}
