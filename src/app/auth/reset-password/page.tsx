"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BrandWordmark } from "@/components/brand-wordmark";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setMessage("Use at least 8 characters.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message);
        return;
      }
      router.replace("/auth/login?signedOut=1");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] bg-white">
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
        <div className="mb-8 flex justify-center">
          <BrandWordmark showTagline={false} />
        </div>
        <div className="rounded-2xl border border-[#e0dedf] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-[#234467]">Set a new password</h1>
          <p className="mt-2 text-sm text-[#6d6e71]">
            Choose a new password for your account, then sign in again.
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block text-xs font-medium text-[#6d6e71]">
              New password
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm outline-none focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8]"
              />
            </label>
            <label className="block text-xs font-medium text-[#6d6e71]">
              Confirm password
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm outline-none focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8]"
              />
            </label>
            {message ? (
              <p className="text-sm text-red-600" role="alert">
                {message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#00a4e4] py-2.5 text-sm font-semibold text-white hover:bg-[#0090c8] disabled:opacity-60"
            >
              {loading ? "Saving…" : "Update password"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#6d6e71]">
            <Link href="/auth/login" className="font-medium text-[#00a4e4] hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
