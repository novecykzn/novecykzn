"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { LoginSessionBanner } from "./login-session-banner";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function LoginPageClient({
  nextPath,
  error,
  signedOut,
}: {
  nextPath?: string;
  error?: string;
  signedOut?: string;
}) {
  const [signedIn, setSignedIn] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  return (
    <>
      {signedOut ? (
        <p className="mt-4 rounded-xl border border-[#dce9c9] bg-[#f7fbe9] px-3 py-2 text-sm text-[#234467]">
          You have been signed out. Sign in again to continue.
        </p>
      ) : null}
      <LoginSessionBanner nextPath={nextPath} onSessionChange={setSignedIn} />
      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Sign-in failed. Check your credentials and try again.
        </p>
      ) : null}
      {!supabaseReady ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Supabase is not configured. Copy <code className="text-xs">.env.example</code> to{" "}
          <code className="text-xs">.env.local</code> and add your project URL and anon key, then
          restart <code className="text-xs">npm run dev</code>.
        </p>
      ) : null}
      <div className="mt-8">
        <LoginForm nextPath={nextPath} disabled={!supabaseReady || signedIn} />
        {signedIn ? (
          <p className="mt-3 text-center text-xs text-[#6d6e71]">
            Sign out above to sign in with another account.
          </p>
        ) : null}
      </div>
    </>
  );
}
