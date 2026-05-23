import { PortalNav } from "@/components/portal/portal-nav";
import { requireProvider } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProvider();
  const profileLabel = profile.company_name ?? profile.full_name ?? "Professional account";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fbff] via-white to-[#f6fbe9]">
      <PortalNav profileLabel={profileLabel} />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</div>
    </div>
  );
}
