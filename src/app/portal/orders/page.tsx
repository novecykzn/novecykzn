import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProvider } from "@/lib/auth/session";
import { formatPaymentMethod, formatPaymentStatus } from "@/lib/payments/methods";

function formatZar(cents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(cents / 100);
}

export default async function OrdersHistoryPage() {
  const { user } = await requireProvider();
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("provider_id", user.id)
    .neq("status", "draft")
    .order("created_at", { ascending: false });

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5f8f37]">Novecy CP KZN</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#234467]">Order history</h1>
      <p className="mt-2 text-sm text-[#6d6e71]">Statuses update when payment and fulfilment events occur.</p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-[#e0dedf] bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#e0dedf] bg-[#f7f9fb] text-xs font-semibold uppercase tracking-wide text-[#6d6e71]">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Order status</th>
              <th className="px-4 py-3">Payment method</th>
              <th className="px-4 py-3">Payment status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-b border-[#eef0f1] last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-[#234467]">{String(o.id).slice(0, 8)}…</td>
                <td className="px-4 py-3 capitalize">
                  <span className="rounded-full bg-[#e6f7fd] px-2.5 py-1 text-xs font-medium text-[#0077aa]">
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#6d6e71]">
                  {formatPaymentMethod(o.payment_method as string)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#f2f4f5] px-2.5 py-1 text-xs font-medium text-[#5c6b7a]">
                    {formatPaymentStatus(o.payment_status as string)}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-[#234467]">{formatZar(o.total_cents ?? 0)}</td>
                <td className="px-4 py-3 text-[#8c8d91]">
                  {o.created_at ? new Date(o.created_at).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && (
          <p className="px-4 py-8 text-center text-sm text-[#8c8d91]">
            No submitted orders.{" "}
            <Link href="/portal/products" className="text-[#00a4e4] underline">
              Start an order
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
