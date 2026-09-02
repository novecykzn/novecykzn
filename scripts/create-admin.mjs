/**
 * Create (or promote) an admin user in Supabase.
 *
 * Usage:
 *   node scripts/create-admin.mjs you@example.com 'YourPassword123!' "Your Name"
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const raw = readFileSync(".env.local", "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const [email, password, fullName] = process.argv.slice(2);
if (!email || !password) {
  console.error(
    "Usage: node scripts/create-admin.mjs <email> <password> [full-name]",
  );
  process.exit(1);
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const displayName = fullName?.trim() || email.split("@")[0];

const { data: listed, error: listErr } = await admin.auth.admin.listUsers();
if (listErr) {
  console.error("Could not list users:", listErr.message);
  process.exit(1);
}

let userId = listed.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id ?? null;

if (userId) {
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
    user_metadata: { full_name: displayName },
  });
  if (error) {
    console.error("Could not update existing user:", error.message);
    process.exit(1);
  }
  console.log(`Updated existing user: ${email}`);
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: displayName },
  });
  if (error || !data.user) {
    console.error("Could not create user:", error?.message ?? "Unknown error");
    process.exit(1);
  }
  userId = data.user.id;
  console.log(`Created user: ${email}`);
}

const { error: profileErr } = await admin.from("profiles").upsert(
  {
    id: userId,
    email,
    full_name: displayName,
    role: "admin",
    updated_at: new Date().toISOString(),
  },
  { onConflict: "id" },
);

if (profileErr) {
  console.error("User created but could not set admin role:", profileErr.message);
  process.exit(1);
}

console.log(`Done. ${email} is now an admin.`);
console.log("Sign in at https://novecykzn.com/auth/login");
