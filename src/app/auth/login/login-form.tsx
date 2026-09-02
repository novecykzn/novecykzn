"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signInWithEmail } from "./actions";
import { requestPasswordReset } from "./reset-actions";

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
      const result = await signInWithEmail(email, password, nextPath);
      if ("error" in result) {
        setMessage(result.error);
        return;
      }
      router.refresh();
      router.push(result.destination);
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
      const result = await requestPasswordReset(email);
      if ("error" in result) {
        setMessage(result.error);
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
        <label className="block text-xs font-medium text-[#6d6e71]">Password</label>
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
      <button
        type="button"
        disabled={resetLoading || disabled}
        onClick={onForgotPassword}
        className="w-full text-sm font-medium text-[#00a4e4] hover:underline disabled:opacity-60"
      >
        {resetLoading ? "Sending reset link…" : "Forgot password?"}
      </button>
    </form>
  );
}
