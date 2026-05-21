import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getSessionProfile } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { BrandWordmark } from "@/components/brand-wordmark";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSessionProfile();
  if (session?.user) {
    const role = session.profile?.role;
    if (role === "admin") redirect(sp.next && sp.next.startsWith("/") ? sp.next : "/admin");
    if (role === "provider") redirect(sp.next && sp.next.startsWith("/") ? sp.next : "/portal");
    redirect("/pending");
  }

  return (
    <div className="min-h-[75vh] bg-white">
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
        <div className="mb-8 flex justify-center">
          <BrandWordmark showTagline={false} />
        </div>
        <div className="rounded-2xl border border-[#e0dedf] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-[#234467]">Professional login</h1>
          <p className="mt-2 text-sm text-[#6d6e71]">
            Approved healthcare professionals only. Public visitors cannot place orders.
          </p>
          {sp.error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              Sign-in failed. Check your credentials and try again.
            </p>
          ) : null}
          {!isSupabaseConfigured() ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              Supabase is not configured. Copy <code className="text-xs">.env.example</code> to{" "}
              <code className="text-xs">.env.local</code> and add your project URL and anon key,
              then restart <code className="text-xs">npm run dev</code>.
            </p>
          ) : null}
          <div className="mt-8">
            <LoginForm nextPath={sp.next} disabled={!isSupabaseConfigured()} />
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-[#6d6e71]">
          Need access?{" "}
          <Link href="/apply" className="font-medium text-[#00a4e4] hover:underline">
            Apply here
          </Link>
        </p>
      </div>
    </div>
  );
}
