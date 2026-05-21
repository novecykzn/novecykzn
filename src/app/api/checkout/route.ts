import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { finalizeCheckout } from "@/lib/orders/checkout";
import type { PaymentMethod } from "@/lib/payments/methods";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const orderId = form?.get("orderId") as string | null;
  const paymentMethod = form?.get("paymentMethod") as PaymentMethod | null;

  if (!orderId || !paymentMethod) {
    return NextResponse.json({ error: "Missing order or payment method" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email, full_name, phone, on_account_approved")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const result = await finalizeCheckout(
    supabase,
    user.id,
    user.email,
    orderId,
    paymentMethod,
    profile,
  );

  if (result.type === "error") {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  const target = result.url.startsWith("http")
    ? result.url
    : `${origin}${result.url}`;

  return NextResponse.redirect(target, 303);
}
