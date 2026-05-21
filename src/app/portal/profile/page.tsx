import { createClient } from "@/lib/supabase/server";
import { requireProvider } from "@/lib/auth/session";

export default async function ProfilePage() {
  const { user } = await requireProvider();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5f8f37]">Novecy CP KZN</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#234467]">Profile</h1>
      <p className="mt-2 text-sm text-[#6d6e71]">Practice details linked to your approved account.</p>
      <dl className="mt-8 grid gap-4 rounded-2xl border border-[#e0dedf] bg-white p-6 text-sm shadow-sm sm:max-w-md">
        <div>
          <dt className="text-[#8c8d91]">Full name</dt>
          <dd className="font-medium text-[#234467]">{profile?.full_name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[#8c8d91]">Organisation</dt>
          <dd className="font-medium text-[#234467]">{profile?.company_name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[#8c8d91]">Email</dt>
          <dd className="font-medium text-[#234467]">{profile?.email ?? user.email}</dd>
        </div>
        <div>
          <dt className="text-[#8c8d91]">Phone</dt>
          <dd className="font-medium text-[#234467]">{profile?.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[#8c8d91]">Practice role</dt>
          <dd className="font-medium capitalize text-[#234467]">
            {profile?.practice_role ?? profile?.role ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[#8c8d91]">Registration number</dt>
          <dd className="font-medium text-[#234467]">{profile?.registration_number ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[#8c8d91]">Address</dt>
          <dd className="font-medium text-[#234467]">
            {[profile?.address, profile?.city, profile?.province].filter(Boolean).join(", ") || "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
