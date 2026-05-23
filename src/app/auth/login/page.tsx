import Link from "next/link";
import { LoginForm } from "./login-form";
import { getSessionProfile } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { BrandWordmark } from "@/components/brand-wordmark";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; signedOut?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSessionProfile();

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
          {sp.signedOut ? (
            <p className="mt-4 rounded-xl border border-[#dce9c9] bg-[#f7fbe9] px-3 py-2 text-sm text-[#234467]">
              You have been signed out. Sign in again to continue.
            </p>
          ) : null}
          {session?.user ? (
            <div className="mt-4 rounded-xl border border-[#bfe8f8] bg-[#f0faff] px-4 py-3 text-sm text-[#234467]">
              <p>
                Signed in as{" "}
                <span className="font-semibold">{session.user.email ?? "your account"}</span>
                {session.profile?.role ? (
                  <span className="text-[#6d6e71]"> ({session.profile.role})</span>
                ) : null}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {session.profile?.role === "admin" ? (
                  <Link
                    href={sp.next?.startsWith("/") ? sp.next : "/admin"}
                    className="font-medium text-[#00a4e4] hover:underline"
                  >
                    Continue to admin
                  </Link>
                ) : null}
                {session.profile?.role === "provider" ? (
                  <Link
                    href={sp.next?.startsWith("/") ? sp.next : "/portal"}
                    className="font-medium text-[#00a4e4] hover:underline"
                  >
                    Continue to portal
                  </Link>
                ) : null}
                {session.profile?.role === "pending" ? (
                  <Link href="/pending" className="font-medium text-[#00a4e4] hover:underline">
                    Continue to application status
                  </Link>
                ) : null}
                <form action="/auth/sign-out" method="post">
                  <button
                    type="submit"
                    className="font-medium text-[#6d6e71] underline-offset-2 hover:text-[#234467] hover:underline"
                  >
                    Sign out
                  </button>
                </form>
              </div>
              <p className="mt-3 text-xs text-[#6d6e71]">
                Sign out first if you want to use a different account below.
              </p>
            </div>
          ) : null}
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
            <LoginForm
              nextPath={sp.next}
              disabled={!isSupabaseConfigured() || !!session?.user}
            />
            {session?.user ? (
              <p className="mt-3 text-center text-xs text-[#6d6e71]">
                Sign out above to sign in with another account.
              </p>
            ) : null}
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
