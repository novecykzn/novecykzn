"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { completeAuthCallback } from "./actions";

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const nextPath = searchParams.get("next") ?? undefined;
      const code = searchParams.get("code");
      const hashParams = new URLSearchParams(
        typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "",
      );
      const authType = hashParams.get("type");

      try {
        if (code) {
          const result = await completeAuthCallback(code, nextPath);
          if (cancelled) return;
          if ("error" in result) {
            setMessage(result.error);
            router.replace("/auth/login?error=1");
            return;
          }
          router.replace(result.destination);
          return;
        }

        const supabase = createClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (cancelled) return;

        if (error || !session?.user) {
          setMessage("Sign-in link expired or invalid.");
          router.replace("/auth/login?error=1");
          return;
        }

        if (authType === "recovery") {
          router.replace("/auth/reset-password");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        const destination =
          nextPath?.startsWith("/")
            ? nextPath
            : profile?.role === "admin"
              ? "/admin"
              : profile?.role === "provider"
                ? "/portal"
                : "/pending";

        if (!cancelled) router.replace(destination);
      } catch {
        if (!cancelled) {
          setMessage("Sign-in could not be completed.");
          router.replace("/auth/login?error=1");
        }
      }
    }

    void finish();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16 text-center">
      <p className="text-sm text-[#6d6e71]">{message}</p>
    </div>
  );
}
