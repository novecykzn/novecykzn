import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, isSupabaseConfigured } from "@/lib/supabase/config";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, getSupabaseAnonKey());
}
