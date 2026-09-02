"use server";

import { createClient } from "@/lib/supabase/server";
import { getPostLoginDestination } from "@/lib/auth/destination";
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
          "Cannot reach Supabase. In Vercel, set NEXT_PUBLIC_SUPABASE_URL to your project URL from Supabase → Project Settings → API, then redeploy.",
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
