"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandWordmark } from "@/components/brand-wordmark";

const navLinks = [
  { href: "/admin", label: "Applications", match: (path: string) => path === "/admin" || path.startsWith("/admin/applications") },
  { href: "/admin/orders", label: "Orders", match: (path: string) => path.startsWith("/admin/orders") },
  { href: "/", label: "Public site", match: () => false },
];

function linkClass(active: boolean) {
  return active
    ? "font-semibold text-[#00a4e4]"
    : "text-[#6d6e71] hover:text-[#0c4a6e]";
}

export function AdminNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#e0dedf] bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <BrandWordmark showTagline={false} className="origin-left scale-[0.78] sm:scale-[0.9]" />
            <span className="shrink-0 rounded-full bg-[#e6f7fd] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#0077aa] sm:px-3 sm:text-xs">
              Admin
            </span>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#d8d8d8] px-3 py-2 text-xs font-semibold text-[#234467] sm:hidden"
            aria-expanded={menuOpen}
            aria-controls="admin-mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            Menu
            <span aria-hidden="true">{menuOpen ? "▲" : "▼"}</span>
          </button>

          <nav className="hidden items-center gap-5 text-sm font-medium sm:flex sm:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.match(pathname))}
              >
                {link.label}
              </Link>
            ))}
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

        {menuOpen ? (
          <nav
            id="admin-mobile-nav"
            className="mt-3 space-y-1 border-t border-[#eef0f1] pt-3 sm:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-xl px-3 py-2.5 text-sm ${linkClass(link.match(pathname))}`}
              >
                {link.label}
              </Link>
            ))}
            <form action="/auth/sign-out" method="post" className="pt-1">
              <button
                type="submit"
                className="w-full rounded-xl border border-[#d8d8d8] px-3 py-2.5 text-left text-sm font-semibold text-[#234467]"
              >
                Sign out
              </button>
            </form>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
