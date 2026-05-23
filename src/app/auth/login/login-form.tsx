"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function LoginForm({
  nextPath,
  disabled,
}: {
  nextPath?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled || !isSupabaseConfigured()) return;
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(error.message);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      router.refresh();

      const destination =
        nextPath?.startsWith("/")
          ? nextPath
          : profile?.role === "admin"
            ? "/admin"
            : profile?.role === "provider"
              ? "/portal"
              : "/pending";

      router.push(destination);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[#6d6e71]">Work email</label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled}
          className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm text-[#234467] outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8] disabled:opacity-50"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#6d6e71]">Password</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={disabled}
          className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm text-[#234467] outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8] disabled:opacity-50"
        />
      </div>
      {message ? (
        <p className="text-sm text-red-600" role="alert">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading || disabled}
        className="w-full rounded-full bg-[#00a4e4] py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0090c8] disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
