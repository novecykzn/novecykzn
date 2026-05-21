import Link from "next/link";
import { requireProvider } from "@/lib/auth/session";
import { BrandWordmark } from "@/components/brand-wordmark";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProvider();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fbff] via-white to-[#f6fbe9]">
      <header className="sticky top-0 z-40 border-b border-[#e0dedf] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <BrandWordmark showTagline={false} className="scale-[0.9] origin-left" />
            <div>
              <span className="rounded-full bg-[#e6f7fd] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0077aa]">
                Professional portal
              </span>
              <p className="mt-1 text-xs text-[#6d6e71]">{profile.company_name ?? profile.full_name}</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm font-medium text-[#6d6e71]">
            <Link href="/portal" className="hover:text-[#0c4a6e]">
              Dashboard
            </Link>
            <Link href="/portal/products" className="hover:text-[#0c4a6e]">
              Catalogue
            </Link>
            <Link href="/portal/cart" className="hover:text-[#0c4a6e]">
              Cart
            </Link>
            <Link href="/portal/orders" className="hover:text-[#0c4a6e]">
              Order history
            </Link>
            <Link href="/portal/profile" className="hover:text-[#0c4a6e]">
              Profile
            </Link>
            <form action="/portal/sign-out" method="post">
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
