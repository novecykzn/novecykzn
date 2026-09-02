"use server";

import { requestPasswordResetEmail } from "@/lib/auth/sign-in";

export async function requestPasswordReset(email: string): Promise<{ ok: true } | { error: string }> {
  return requestPasswordResetEmail(email);
}
