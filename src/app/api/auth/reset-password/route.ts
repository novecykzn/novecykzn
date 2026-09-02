import { NextResponse } from "next/server";
import { requestPasswordResetEmail } from "@/lib/auth/sign-in";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = String(body.email ?? "").trim();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const result = await requestPasswordResetEmail(email);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
