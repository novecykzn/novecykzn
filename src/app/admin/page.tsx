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
      <h1 className="text-2xl font-semibold tracking-tight text-[#234467] sm:text-3xl">Applications</h1>
      <p className="mt-2 text-sm text-[#6d6e71]">
        Review healthcare professional access requests. Approve to create or activate portal
        accounts.
      </p>

      <div className="mt-6 space-y-3 md:hidden">
        {(applications ?? []).map((a) => (
          <article
            key={a.id}
            className="rounded-2xl border border-[#e0dedf] bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-[#234467]">{a.full_name}</p>
                <p className="mt-0.5 truncate text-sm text-[#6d6e71]">{a.company_name}</p>
                <p className="mt-1 truncate text-sm text-[#6d6e71]">{a.email}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(a.status)}`}
              >
                {a.status}
              </span>
            </div>
            <p className="mt-3 text-xs text-[#8c8d91]">
              {a.created_at ? new Date(a.created_at).toLocaleString() : "—"}
            </p>
            <Link
              href={`/admin/applications/${a.id}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#00a4e4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0090c8]"
            >
              Review application
            </Link>
          </article>
        ))}
        {(!applications || applications.length === 0) && (
          <p className="rounded-2xl border border-[#e0dedf] bg-white px-4 py-8 text-center text-sm text-[#8c8d91]">
            No applications yet.
          </p>
        )}
      </div>

      <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-[#e0dedf] bg-white shadow-sm md:block md:mt-8">
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
