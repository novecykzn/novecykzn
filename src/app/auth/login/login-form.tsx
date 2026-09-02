"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled || !isSupabaseConfigured()) return;
    setLoading(true);
    setMessage(null);
    setNotice(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nextPath }),
      });
      const result = (await response.json()) as { error?: string; destination?: string };
      if (!response.ok || result.error) {
        setMessage(result.error ?? "Sign-in failed. Please try again.");
        return;
      }
      if (result.destination) {
        router.refresh();
        router.push(result.destination);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword() {
    if (disabled || !isSupabaseConfigured()) return;
    if (!email.trim()) {
      setMessage("Enter your email above, then click Forgot password.");
      return;
    }
    setResetLoading(true);
    setMessage(null);
    setNotice(null);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { error?: string; ok?: boolean };
      if (!response.ok || result.error) {
        setMessage(result.error ?? "Could not send reset email.");
        return;
      }
      setNotice("If that email exists, a reset link was sent. Check your inbox.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setResetLoading(false);
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
        <div className="flex items-center justify-between gap-3">
          <label className="block text-xs font-medium text-[#6d6e71]">Password</label>
          <button
            type="button"
            disabled={resetLoading || disabled}
            onClick={onForgotPassword}
            className="text-xs font-medium text-[#00a4e4] hover:underline disabled:opacity-60"
          >
            {resetLoading ? "Sending…" : "Forgot password?"}
          </button>
        </div>
        <div className="relative mt-1">
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-[#d8d8d8] px-3 py-2 pr-10 text-sm text-[#234467] outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8] disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-[#6d6e71] transition hover:text-[#234467] disabled:opacity-50"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {notice ? (
        <p className="text-sm text-[#166534]" role="status">
          {notice}
        </p>
      ) : null}
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
