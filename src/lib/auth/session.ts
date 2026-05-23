import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function getSessionProfile() {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return null;
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) return { user, profile: null };
    return { user, profile };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const s = await getSessionProfile();
  if (!s?.user) redirect("/auth/login?next=/admin");
  if (s.profile?.role !== "admin") redirect("/portal");
  return s as typeof s & { profile: NonNullable<(typeof s)["profile"]> };
}

export async function requireProvider() {
  const s = await getSessionProfile();
  if (!s?.user) redirect("/auth/login?next=/portal");
  if (s.profile?.role !== "provider") redirect("/pending");
  return s as typeof s & { profile: NonNullable<(typeof s)["profile"]> };
}
