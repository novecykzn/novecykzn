import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProvider } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";

export default async function PortalDashboardPage() {
  await requireProvider();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", user!.id)
    .neq("status", "draft");

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5f8f37]">Novecy CP KZN</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#234467]">Dashboard</h1>
      <p className="mt-2 text-sm text-[#6d6e71]">
        Approved professional ordering only. Build an order from the catalogue and submit
        for secure payment in ZAR.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card className="rounded-2xl border-[#d6deea] bg-white p-6">
          <p className="text-sm font-medium text-[#8c8d91]">Submitted orders</p>
          <p className="mt-2 text-3xl font-semibold text-[#234467]">{count ?? 0}</p>
          <Link href="/portal/orders" className="mt-4 inline-block text-sm font-medium text-[#00a4e4] hover:underline">
            View history →
          </Link>
        </Card>
        <Card className="rounded-2xl border-[#dce9c9] bg-[#f7fbe9] p-6">
          <p className="text-sm font-medium text-[#8c8d91]">Quick action</p>
          <Link
            href="/portal/products"
            className="mt-4 inline-flex rounded-full bg-[#00a4e4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0090c8]"
          >
            Browse catalogue
          </Link>
        </Card>
      </div>
    </div>
  );
}
