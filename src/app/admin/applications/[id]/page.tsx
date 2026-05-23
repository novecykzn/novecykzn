import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApplicationActions } from "./actions-panel";

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: app } = await supabase.from("applications").select("*").eq("id", id).single();

  if (!app) notFound();

  const admin = createAdminClient();
  let onAccountApproved = false;
  if (app.applicant_user_id) {
    const { data: providerProfile } = await admin
      .from("profiles")
      .select("on_account_approved")
      .eq("id", app.applicant_user_id)
      .maybeSingle();
    onAccountApproved = Boolean(providerProfile?.on_account_approved);
  }
  const { data: docs } = await admin
    .from("application_documents")
    .select("*")
    .eq("application_id", id);

  const docLinks = await Promise.all(
    (docs ?? []).map(async (d) => {
      const path = d.file_url as string;
      const { data: signed } = await admin.storage
        .from("application-documents")
        .createSignedUrl(path, 3600);
      return { ...d, signedUrl: signed?.signedUrl ?? null };
    }),
  );

  return (
    <div>
      <Link href="/admin" className="text-sm font-medium text-[#00a4e4] hover:underline">
        ← Back to list
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#234467] sm:mt-6 sm:text-3xl">{app.full_name}</h1>
      <p className="text-sm text-[#6d6e71]">{app.company_name}</p>

      <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-[#e0dedf] bg-white p-4 shadow-sm">
          <dt className="text-[#8c8d91]">Email</dt>
          <dd className="mt-1 font-medium text-[#234467]">{app.email}</dd>
        </div>
        <div className="rounded-xl border border-[#e0dedf] bg-white p-4 shadow-sm">
          <dt className="text-[#8c8d91]">Phone</dt>
          <dd className="mt-1 font-medium text-[#234467]">{app.phone}</dd>
        </div>
        <div className="rounded-xl border border-[#e0dedf] bg-white p-4 shadow-sm">
          <dt className="text-[#8c8d91]">Role</dt>
          <dd className="mt-1 font-medium text-[#234467]">{app.role}</dd>
        </div>
        <div className="rounded-xl border border-[#e0dedf] bg-white p-4 shadow-sm">
          <dt className="text-[#8c8d91]">Registration #</dt>
          <dd className="mt-1 font-medium text-[#234467]">{app.registration_number}</dd>
        </div>
        <div className="rounded-xl border border-[#e0dedf] bg-white p-4 shadow-sm sm:col-span-2">
          <dt className="text-[#8c8d91]">Address</dt>
          <dd className="mt-1 font-medium text-[#234467]">
            {app.address}, {app.city}, {app.province}
          </dd>
        </div>
        {app.notes ? (
          <div className="rounded-xl border border-[#e0dedf] bg-white p-4 shadow-sm sm:col-span-2">
            <dt className="text-[#8c8d91]">Applicant notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-[#4a4a4a]">{app.notes}</dd>
          </div>
        ) : null}
        {app.internal_notes ? (
          <div className="rounded-xl border border-[#e0dedf] bg-white p-4 shadow-sm sm:col-span-2">
            <dt className="text-[#8c8d91]">Internal notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-[#4a4a4a]">{app.internal_notes}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-8 rounded-xl border border-[#e0dedf] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#0077aa]">Documents</h2>
        <ul className="mt-2 space-y-2">
          {docLinks.map((d) => (
            <li key={d.id}>
              {d.signedUrl ? (
                <a
                  href={d.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#00a4e4] hover:underline"
                >
                  {d.file_name}
                </a>
              ) : (
                <span className="text-sm text-[#6d6e71]">{d.file_name} (unavailable)</span>
              )}
            </li>
          ))}
        </ul>
        {docLinks.length === 0 ? (
          <p className="text-sm text-[#8c8d91]">No files uploaded.</p>
        ) : null}
      </div>

      <ApplicationActions
        applicationId={app.id}
        currentStatus={app.status}
        applicantUserId={app.applicant_user_id as string | null}
        onAccountApproved={onAccountApproved}
      />
    </div>
  );
}
