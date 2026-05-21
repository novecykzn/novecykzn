"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandWordmark } from "@/components/brand-wordmark";

const nav = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/for-providers", label: "Healthcare professionals" },
  { href: "/contact", label: "Contact" },
  { href: "/apply", label: "Apply for access" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e0dedf] bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <BrandWordmark showTagline />

        <nav className="hidden flex-1 items-center justify-end gap-4 text-sm font-medium text-[#6d6e71] xl:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-jakarta whitespace-nowrap transition-colors hover:text-[#00a4e4]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="font-jakarta inline-flex whitespace-nowrap rounded-full bg-[#00a4e4] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0090c8] sm:px-4 sm:text-sm"
          >
            Professional access
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8d8d8] text-[#234467] hover:bg-[#f7f7f7] xl:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-[#e0dedf] bg-[#fafafa] px-4 py-3 xl:hidden">
          <ul className="space-y-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-jakarta block rounded-xl px-3 py-2 text-sm font-medium text-[#4a4a4a] hover:bg-white hover:text-[#00a4e4]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
