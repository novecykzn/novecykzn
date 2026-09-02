"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function requestPasswordReset(email: string): Promise<{ ok: true } | { error: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured on this deployment." };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || "https://novecykzn.com";

  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/auth/callback`,
    });
    if (error) return { error: error.message };
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not send reset email.";
    return { error: msg };
  }
}
