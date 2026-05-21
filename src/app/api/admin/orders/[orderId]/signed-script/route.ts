import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await context.params;
  const session = await getSessionProfile();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("signed_script_path, signed_script_file_name")
    .eq("id", orderId)
    .single();

  if (!order?.signed_script_path) {
    return NextResponse.json({ error: "No signed script for this order." }, { status: 404 });
  }

  const { data: file, error } = await admin.storage
    .from("order-scripts")
    .download(order.signed_script_path as string);

  if (error || !file) {
    console.error("[admin signed-script]", error);
    return NextResponse.json({ error: "Could not load signed script file." }, { status: 500 });
  }

  const filename =
    (order.signed_script_file_name as string)?.replace(/[^\w.\-]/g, "_") ??
    `signed-script-${orderId.slice(0, 8)}.pdf`;
  const bytes = Buffer.from(await file.arrayBuffer());

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
