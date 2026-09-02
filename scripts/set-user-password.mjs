/**
 * One-off admin helper — set a user's password from your machine.
 *
 * Usage:
 *   node scripts/set-user-password.mjs hannah@vhaistudios.com 'YourNewPassword123!'
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

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: node scripts/set-user-password.mjs <email> <new-password>");
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

const { data: listed, error: listErr } = await admin.auth.admin.listUsers();
if (listErr) {
  console.error("Could not list users:", listErr.message);
  process.exit(1);
}

const user = listed.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  console.error(`No user found for ${email}`);
  process.exit(1);
}

const { error } = await admin.auth.admin.updateUserById(user.id, { password });
if (error) {
  console.error("Could not update password:", error.message);
  process.exit(1);
}

console.log(`Password updated for ${email}`);
