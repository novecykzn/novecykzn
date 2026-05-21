import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/for-providers", label: "Healthcare professional access" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#e3e3e3] bg-white text-[#6d6e71]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Image
              src="/novecylogo.png"
              alt="Novecy logo"
              width={220}
              height={78}
              className="h-auto w-auto max-w-[220px]"
            />
            <ul className="font-jakarta mt-6 space-y-2 text-sm">
              <li><span className="text-[#8b8b8b]">Phone</span><br /><a href="tel:+27824544655" className="text-[#00a4e4] hover:underline">+27 82 454 4655</a></li>
              <li><span className="text-[#8b8b8b]">Email</span><br /><a href="mailto:office@novecy.net" className="text-[#00a4e4] hover:underline">office@novecy.net</a></li>
              <li><span className="text-[#8b8b8b]">Trading hours</span><br /><span className="text-[#6d6e71]">Mon-Thu 8am - 5pm • Fri 7am - 3pm • Sat &amp; Sun Closed</span></li>
              <li><span className="text-[#8b8b8b]">Address</span><br /><span className="text-[#6d6e71]">Unit 22 The Station, North Point, R102, Ballito, 4420</span></li>
            </ul>
          </div>

          <div className="lg:pt-[96px]">
            <ul className="font-jakarta space-y-2 text-sm">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[#00a4e4] transition-colors hover:underline">{item.label}</Link>
                </li>
              ))}
              <li><Link href="/apply" className="text-[#00a4e4] transition-colors hover:underline">Apply for access</Link></li>
            </ul>
          </div>

        </div>

        <p className="font-jakarta mt-10 text-center text-xs text-[#6d6e71]">
          Practitioner-only resources, pricing and ordering access are restricted to approved healthcare professionals.
        </p>

        <div className="font-jakarta mt-10 flex flex-col gap-2 border-t border-[#ececec] pt-8 text-xs text-[#8b8b8b] sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Novecy CP KZN. For professional use only.</p>
          <Link href="/about" className="text-[#00a4e4] hover:underline">Quality &amp; compliance</Link>
        </div>
      </div>
    </footer>
  );
}
