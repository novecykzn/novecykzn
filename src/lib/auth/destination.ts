import { createClient } from "@/lib/supabase/server";

export async function getPostLoginDestination(
  userId: string,
  nextPath?: string | null,
): Promise<string> {
  if (nextPath?.startsWith("/")) return nextPath;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role === "admin") return "/admin";
  if (profile?.role === "provider") return "/portal";
  return "/pending";
}
