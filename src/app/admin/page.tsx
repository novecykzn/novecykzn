import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminApplicationsPage() {
  const supabase = await createClient();
  const { data: applications } = await supabase
    .from("applications")
    .select("id, full_name, company_name, email, status, created_at, province, role")
    .order("created_at", { ascending: false });

  function statusClasses(status: string | null) {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "needs_more_info":
        return "bg-orange-100 text-orange-800";
      case "approved":
        return "bg-emerald-100 text-emerald-800";
      case "rejected":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-[#234467]">Applications</h1>
      <p className="mt-2 text-sm text-[#6d6e71]">
        Review healthcare professional access requests. Approve to create or activate portal
        accounts.
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[#e0dedf] bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#e0dedf] bg-[#f7f9fb] text-xs font-semibold uppercase tracking-wide text-[#6d6e71]">
            <tr>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Organisation</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(applications ?? []).map((a) => (
              <tr key={a.id} className="border-b border-[#eef0f1] last:border-0">
                <td className="px-4 py-3 font-medium text-[#234467]">{a.full_name}</td>
                <td className="px-4 py-3 text-[#6d6e71]">{a.company_name}</td>
                <td className="px-4 py-3 text-[#6d6e71]">{a.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(a.status)}`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#8c8d91]">
                  {a.created_at ? new Date(a.created_at).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/applications/${a.id}`}
                    className="font-medium text-[#00a4e4] hover:underline"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!applications || applications.length === 0) && (
          <p className="px-4 py-8 text-center text-sm text-[#8c8d91]">No applications yet.</p>
        )}
      </div>
    </div>
  );
}
