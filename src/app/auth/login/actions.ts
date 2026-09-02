"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signInWithEmail(
  email: string,
  password: string,
  nextPath?: string,
): Promise<{ error: string } | { destination: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured on this deployment." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    return { error: profileError.message };
  }

  const destination =
    nextPath?.startsWith("/")
      ? nextPath
      : profile?.role === "admin"
        ? "/admin"
        : profile?.role === "provider"
          ? "/portal"
          : "/pending";

  return { destination };
}
