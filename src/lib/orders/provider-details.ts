import type { SupabaseClient } from "@supabase/supabase-js";

export type ProviderOrderDetails = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  practiceRole: string;
  registrationNumber: string;
  address: string;
  city: string;
  province: string;
};

type ApplicationRow = {
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  role: string;
  registration_number: string;
  address: string;
  city: string;
  province: string;
};

async function fetchApprovedApplication(
  supabase: SupabaseClient,
  userId: string,
  emails: string[],
) {
  const { data: byUser } = await supabase
    .from("applications")
    .select(
      "full_name, company_name, email, phone, role, registration_number, address, city, province",
    )
    .eq("applicant_user_id", userId)
    .eq("status", "approved")
    .order("reviewed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byUser) return byUser as ApplicationRow;

  for (const raw of emails) {
    const email = raw?.trim().toLowerCase();
    if (!email) continue;
    const { data: byEmail } = await supabase
      .from("applications")
      .select(
        "full_name, company_name, email, phone, role, registration_number, address, city, province",
      )
      .eq("status", "approved")
      .ilike("email", email)
      .order("reviewed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (byEmail) return byEmail as ApplicationRow;
  }

  return null;
}

function mergeDetails(
  profile: Record<string, unknown> | null,
  app: ApplicationRow | null,
  userEmail?: string | null,
): ProviderOrderDetails {
  return {
    fullName:
      (profile?.full_name as string) ?? app?.full_name ?? "—",
    companyName:
      (profile?.company_name as string) ?? app?.company_name ?? "—",
    email:
      (profile?.email as string) ?? app?.email ?? userEmail ?? "—",
    phone: (profile?.phone as string) ?? app?.phone ?? "—",
    practiceRole:
      (profile?.practice_role as string) ??
      (profile?.role as string) ??
      app?.role ??
      "—",
    registrationNumber:
      (profile?.registration_number as string) ?? app?.registration_number ?? "—",
    address: (profile?.address as string) ?? app?.address ?? "—",
    city: (profile?.city as string) ?? app?.city ?? "—",
    province: (profile?.province as string) ?? app?.province ?? "—",
  };
}

/** Professional details for order PDFs — profile + approved application. */
export async function getProviderOrderDetails(
  supabase: SupabaseClient,
  userId: string,
  userEmail?: string | null,
): Promise<ProviderOrderDetails | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("[provider-details] profile query failed:", profileError.message);
  }

  const emails = [
    userEmail,
    profile?.email as string | undefined,
  ].filter(Boolean) as string[];

  const app = await fetchApprovedApplication(supabase, userId, emails);

  if (!profile && !app) return null;

  return mergeDetails(profile, app, userEmail);
}
