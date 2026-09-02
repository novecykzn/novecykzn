import { createClient } from "@/lib/supabase/server";
import { getPostLoginDestination } from "@/lib/auth/destination";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signInWithEmailCredentials(
  email: string,
  password: string,
  nextPath?: string,
): Promise<{ error: string } | { destination: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured on this deployment." };
  }

  const supabase = await createClient();

  let authResult: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;
  try {
    authResult = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sign-in failed.";
    if (/fetch failed|ENOTFOUND|getaddrinfo|ECONNREFUSED/i.test(msg)) {
      return {
        error:
          "Cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL and redeploy.",
      };
    }
    return { error: msg };
  }

  const { data, error } = authResult;

  if (error) {
    return { error: error.message };
  }

  const destination = await getPostLoginDestination(data.user.id, nextPath);
  return { destination };
}

export async function requestPasswordResetEmail(
  email: string,
): Promise<{ ok: true } | { error: string }> {
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
