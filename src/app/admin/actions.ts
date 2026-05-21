"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { sendApprovalInvite, sendOrderPackedNotification, sendRejection } from "@/lib/email/resend";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

export async function approveApplication(
  applicationId: string,
  options?: { onAccountApproved?: boolean },
) {
  const { user: adminUser } = await requireAdmin();
  const admin = createAdminClient();

  const { data: app, error: fetchErr } = await admin
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .single();

  if (fetchErr || !app) throw new Error("Application not found");

  if (app.status === "approved") {
    return { ok: true as const, message: "Already approved." };
  }

  const email = app.email as string;

  let userId: string | null = null;

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile?.id) {
    userId = existingProfile.id;
  } else {
    const password = randomBytes(18).toString("base64url");
    const { data: created, error: creErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: app.full_name },
    });
    if (creErr?.message?.toLowerCase().includes("registered")) {
      const { data: again } = await admin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (again?.id) userId = again.id;
    } else if (creErr || !created?.user) {
      console.error(creErr);
      throw new Error(creErr?.message ?? "Could not create user");
    } else {
      userId = created.user.id;
    }
  }

  if (!userId) {
    throw new Error("Could not resolve or create auth user for this email.");
  }

  await admin
    .from("profiles")
    .update({
      role: "provider",
      full_name: app.full_name,
      company_name: app.company_name,
      phone: app.phone,
      email,
      registration_number: app.registration_number,
      practice_role: app.role,
      address: app.address,
      city: app.city,
      province: app.province,
      on_account_approved: Boolean(options?.onAccountApproved),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId!);

  await admin
    .from("applications")
    .update({
      status: "approved",
      applicant_user_id: userId,
      reviewed_by: adminUser.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  const { data: linkData } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  const inviteLink =
    linkData?.properties?.action_link ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/login`;

  await sendApprovalInvite({
    email,
    name: app.full_name,
    inviteLink,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  return { ok: true as const };
}

export async function rejectApplication(applicationId: string, reason?: string) {
  const { user } = await requireAdmin();
  const admin = createAdminClient();

  const { data: app } = await admin
    .from("applications")
    .select("full_name, email")
    .eq("id", applicationId)
    .single();

  await admin
    .from("applications")
    .update({
      status: "rejected",
      internal_notes: reason ?? null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (app?.email) {
    await sendRejection(app.email, app.full_name ?? "Applicant", reason);
  }

  revalidatePath("/admin");
  return { ok: true as const };
}

export async function setApplicationNotes(applicationId: string, internalNotes: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("applications")
    .update({ internal_notes: internalNotes, updated_at: new Date().toISOString() })
    .eq("id", applicationId);
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function setApplicationStatus(
  applicationId: string,
  status: "pending" | "approved" | "rejected" | "needs_more_info",
) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", applicationId);
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function setProviderOnAccount(providerId: string, enabled: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({
      on_account_approved: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", providerId);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function updateEftPaymentStatus(
  orderId: string,
  paymentStatus: "awaiting_eft" | "pop_received" | "paid" | "cancelled",
) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, payment_method")
    .eq("id", orderId)
    .single();

  if (!order) throw new Error("Order not found.");
  if (order.payment_method !== "eft") {
    throw new Error("This order was not placed via EFT.");
  }

  const now = new Date().toISOString();
  let status = "pending_payment";
  if (paymentStatus === "paid") status = "paid";
  if (paymentStatus === "cancelled") status = "cancelled";

  await admin
    .from("orders")
    .update({
      payment_status: paymentStatus,
      status,
      updated_at: now,
    })
    .eq("id", orderId);

  revalidatePath("/admin/orders");
  revalidatePath("/portal/orders");
  return { ok: true as const };
}

export async function markOrderPacked(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const orderId = String(formData.get("orderId") ?? "").trim();
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const courier = String(formData.get("courier") ?? "").trim();
  const trackingUrl = String(formData.get("trackingUrl") ?? "").trim();

  if (!orderId) throw new Error("Missing order ID.");
  if (!trackingNumber) throw new Error("Tracking number is required.");

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("id, provider_id")
    .eq("id", orderId)
    .single();

  if (orderErr || !order) throw new Error("Order not found.");

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, company_name, email")
    .eq("id", order.provider_id)
    .maybeSingle();

  await admin
    .from("orders")
    .update({
      status: "processing",
      tracking_number: trackingNumber,
      tracking_courier: courier || null,
      tracking_url: trackingUrl || null,
      packed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (profile?.email) {
    await sendOrderPackedNotification({
      email: profile.email,
      name: profile.full_name ?? profile.company_name ?? "Provider",
      orderId,
      trackingNumber,
      courier: courier || null,
      trackingUrl: trackingUrl || null,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath("/portal/orders");
}
