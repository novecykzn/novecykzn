import { NextResponse } from "next/server";
import { signInWithEmailCredentials } from "@/lib/auth/sign-in";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    nextPath?: string;
  };

  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const nextPath = body.nextPath;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const result = await signInWithEmailCredentials(email, password, nextPath);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  return NextResponse.json({ destination: result.destination });
}
