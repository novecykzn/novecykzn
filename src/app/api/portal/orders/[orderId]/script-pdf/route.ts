import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProviderOrderDetails } from "@/lib/orders/provider-details";
import { buildOrderScriptPdf } from "@/lib/orders/script-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "provider") {
      return NextResponse.json({ error: "Professional access required." }, { status: 403 });
    }

    const { data: order } = await supabase
      .from("orders")
      .select("id, provider_id, status, total_cents, created_at")
      .eq("id", orderId)
      .eq("provider_id", user.id)
      .single();

    if (!order || order.status !== "draft") {
      return NextResponse.json({ error: "Invalid or submitted order." }, { status: 400 });
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("product_name_snapshot, quantity, unit_price_cents, total_price_cents")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (!items?.length) {
      return NextResponse.json({ error: "Add items to your cart first." }, { status: 400 });
    }

    let provider = await getProviderOrderDetails(supabase, user.id, user.email);

    if (!provider) {
      try {
        const admin = createAdminClient();
        provider = await getProviderOrderDetails(admin, user.id, user.email);
      } catch (e) {
        console.warn("[script-pdf] admin fallback unavailable", e);
      }
    }

    if (!provider) {
      return NextResponse.json(
        {
          error:
            "We could not load your practice details. Check your profile or contact Novecy CP KZN.",
        },
        { status: 400 },
      );
    }

    if (provider.registrationNumber === "—" || provider.address === "—") {
      try {
        const admin = createAdminClient();
        const enriched = await getProviderOrderDetails(admin, user.id, user.email);
        if (enriched) provider = enriched;
      } catch {
        /* continue with partial details */
      }
    }

    const pdf = await buildOrderScriptPdf({
      orderId,
      provider,
      lines: items.map((i) => ({
        name: i.product_name_snapshot as string,
        quantity: i.quantity as number,
        unitCents: i.unit_price_cents as number,
        totalCents: i.total_price_cents as number,
      })),
      totalCents: order.total_cents as number,
      createdAt: new Date(order.created_at as string),
    });

    const filename = `novecy-order-${orderId.slice(0, 8)}.pdf`;
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[script-pdf]", err);
    return NextResponse.json(
      { error: "Could not generate PDF. Please try again or contact support." },
      { status: 500 },
    );
  }
}
