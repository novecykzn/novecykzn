"use server";

import { createClient } from "@/lib/supabase/server";
import { getPostLoginDestination } from "@/lib/auth/destination";

export async function completeAuthCallback(
  code: string,
  nextPath?: string,
): Promise<{ error: string } | { destination: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Sign-in could not be completed." };
  }

  const destination = await getPostLoginDestination(data.user.id, nextPath);
  return { destination };
}
