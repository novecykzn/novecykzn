import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function getSessionProfile() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return { user, profile };
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
