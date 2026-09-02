"use server";

import { signInWithEmailCredentials } from "@/lib/auth/sign-in";

export async function signInWithEmail(
  email: string,
  password: string,
  nextPath?: string,
): Promise<{ error: string } | { destination: string }> {
  return signInWithEmailCredentials(email, password, nextPath);
}
