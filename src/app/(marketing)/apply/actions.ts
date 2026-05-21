"use server";

import { applicationFormSchema } from "@/lib/validations/application";
import { createAdminClient } from "@/lib/supabase/admin";
import { appendApplicationRow } from "@/lib/google/sheets";
import { sendAdminNewApplication, sendApplicantConfirmation } from "@/lib/email/resend";
import { revalidatePath } from "next/cache";

export type SubmitApplicationState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitApplication(
  _prev: SubmitApplicationState,
  formData: FormData,
): Promise<SubmitApplicationState> {
  const consent = formData.get("consent") === "on" || formData.get("consent") === "true";
  const parsed = applicationFormSchema.safeParse({
    full_name: formData.get("full_name"),
    company_name: formData.get("company_name"),
    role: formData.get("role"),
    registration_number: formData.get("registration_number"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    province: formData.get("province"),
    notes: formData.get("notes") ?? "",
    consent,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    const flat = parsed.error.flatten().fieldErrors;
    Object.keys(flat).forEach((k) => {
      const arr = flat[k as keyof typeof flat];
      if (arr?.[0]) fieldErrors[k] = arr[0];
    });
    return { fieldErrors, error: "Please correct the highlighted fields." };
  }

  const data = parsed.data;
  const admin = createAdminClient();

  const { data: row, error: insertErr } = await admin
    .from("applications")
    .insert({
      full_name: data.full_name,
      company_name: data.company_name,
      role: data.role,
      registration_number: data.registration_number,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      province: data.province,
      notes: data.notes || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertErr || !row) {
    console.error(insertErr);
    return { error: "We could not save your application. Please try again later." };
  }

  const applicationId = row.id as string;

  const files = formData.getAll("documents") as File[];
  for (const file of files) {
    if (!file || typeof file === "string" || file.size === 0) continue;
    const path = `${applicationId}/${Date.now()}_${file.name.replace(/[^\w.\-]/g, "_")}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await admin.storage
      .from("application-documents")
      .upload(path, buf, { contentType: file.type || "application/octet-stream" });

    if (!upErr) {
      await admin.from("application_documents").insert({
        application_id: applicationId,
        file_url: path,
        file_name: file.name,
        file_type: file.type || null,
      });
    }
  }

  try {
    const sheet = await appendApplicationRow([
    new Date().toISOString(),
    applicationId,
    data.full_name,
    data.company_name,
    data.role,
    data.email,
    data.phone,
    data.province,
    "pending",
  ]);
    if (sheet.rowId) {
      await admin
        .from("applications")
        .update({ google_sheet_row_id: sheet.rowId })
        .eq("id", applicationId);
    }
  } catch (e) {
    console.warn("[sheets]", e);
  }

  try {
    await sendAdminNewApplication({
      applicationId,
      applicantName: data.full_name,
      company: data.company_name,
      email: data.email,
    });
    await sendApplicantConfirmation(data.email, data.full_name);
  } catch (e) {
    console.warn("[email]", e);
  }

  revalidatePath("/apply");
  return { ok: true };
}
