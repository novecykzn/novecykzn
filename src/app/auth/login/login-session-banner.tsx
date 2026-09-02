"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type SessionState = {
  email: string | null;
  role: string | null;
};

export function LoginSessionBanner({
  nextPath,
  onSessionChange,
}: {
  nextPath?: string;
  onSessionChange: (signedIn: boolean) => void;
}) {
  const [session, setSession] = useState<SessionState | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      onSessionChange(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;

        if (!user) {
          onSessionChange(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        setSession({
          email: user.email ?? null,
          role: (profile?.role as string | null) ?? null,
        });
        onSessionChange(true);
      } catch {
        if (!cancelled) onSessionChange(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [onSessionChange]);

  if (!session) return null;

  return (
    <div className="mt-4 rounded-xl border border-[#bfe8f8] bg-[#f0faff] px-4 py-3 text-sm text-[#234467]">
      <p>
        Signed in as <span className="font-semibold">{session.email ?? "your account"}</span>
        {session.role ? <span className="text-[#6d6e71]"> ({session.role})</span> : null}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {session.role === "admin" ? (
          <Link
            href={nextPath?.startsWith("/") ? nextPath : "/admin"}
            className="font-medium text-[#00a4e4] hover:underline"
          >
            Continue to admin
          </Link>
        ) : null}
        {session.role === "provider" ? (
          <Link
            href={nextPath?.startsWith("/") ? nextPath : "/portal"}
            className="font-medium text-[#00a4e4] hover:underline"
          >
            Continue to portal
          </Link>
        ) : null}
        {session.role === "pending" ? (
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
  );
}
