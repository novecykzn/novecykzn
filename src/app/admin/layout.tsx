import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { BrandWordmark } from "@/components/brand-wordmark";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <header className="sticky top-0 z-40 border-b border-[#e0dedf] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <BrandWordmark showTagline={false} className="scale-[0.9] origin-left" />
            <span className="rounded-full bg-[#e6f7fd] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0077aa]">
              Admin
            </span>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-[#6d6e71]">
            <Link href="/admin" className="hover:text-[#0c4a6e]">
              Applications
            </Link>
            <Link href="/admin/orders" className="hover:text-[#0c4a6e]">
              Orders
            </Link>
            <Link href="/" className="hover:text-[#0c4a6e]">
              Public site
            </Link>
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="rounded-full border border-[#d8d8d8] px-3 py-1.5 text-xs font-semibold text-[#234467] transition hover:border-[#00a4e4] hover:text-[#00a4e4]"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}
