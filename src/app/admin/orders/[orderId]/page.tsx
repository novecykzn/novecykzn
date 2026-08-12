import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import {
  OrderDetailCard,
  type OrderDetailItem,
  type OrderDetailProfile,
  type OrderDetailRecord,
  type OrderDetailShipping,
} from "../order-detail-card";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await requireAdmin();
  const { orderId } = await params;
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select(
      "id, status, payment_status, payment_method, payment_provider, payment_reference, subtotal_cents, total_cents, created_at, provider_id, tracking_number, tracking_courier, tracking_url, packed_at, signed_script_path, signed_script_file_name, signed_script_uploaded_at",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.status === "draft") notFound();

  const [{ data: profile }, { data: items }, { data: applications }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, email, full_name, company_name, phone")
      .eq("id", order.provider_id)
      .maybeSingle(),
    admin
      .from("order_items")
      .select("id, product_name_snapshot, quantity, total_price_cents")
      .eq("order_id", orderId),
    admin
      .from("applications")
      .select("applicant_user_id, address, city, province, status, reviewed_at")
      .eq("status", "approved")
      .eq("applicant_user_id", order.provider_id)
      .order("reviewed_at", { ascending: false })
      .limit(1),
  ]);

  const shippingRow = applications?.[0];
  const shipping: OrderDetailShipping | undefined = shippingRow
    ? {
        address: shippingRow.address,
        city: shippingRow.city,
        province: shippingRow.province,
      }
    : undefined;

  return (
    <div>
      <Link href="/admin/orders" className="text-sm font-medium text-[#00a4e4] hover:underline">
        ← Back to orders
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#234467] sm:mt-6 sm:text-3xl">
        Order details
      </h1>
      <p className="mt-2 text-sm text-[#6d6e71]">
        Review the signed script, update EFT payment status, then pack and send tracking.
      </p>
      <div className="mt-6">
        <OrderDetailCard
          order={order as OrderDetailRecord}
          profile={(profile as OrderDetailProfile | null) ?? undefined}
          items={(items ?? []) as OrderDetailItem[]}
          shipping={shipping}
        />
      </div>
    </div>
  );
}
