import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact & enquiries",
};

export default function ContactPage() {
  const whatsappHref = process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/27824544655";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="font-jakarta text-center text-xs font-bold uppercase tracking-[0.22em] text-[#5f8f37]">
        Novecy CP KZN
      </p>
      <h1 className="font-nunito mt-3 text-center text-3xl font-bold text-[#234467]">Contact &amp; enquiries</h1>
      <div className="font-jakarta mt-6 space-y-4 text-center leading-relaxed text-[#6d6e71]">
        <p>
          For general enquiries, practitioner support or further information about Novecy CP KZN,
          our team is available to assist directly.
        </p>
        <p>
          Healthcare professionals are welcome to contact the pharmacy regarding compounding
          enquiries, access requests and general support.
        </p>
      </div>

      <dl className="font-jakarta mt-10 space-y-6 rounded-2xl border border-[#e0dedf] bg-[#f8faf9] p-6 text-sm shadow-sm">
        <div>
          <dt className="font-semibold text-[#234467]">Telephone</dt>
          <dd className="mt-1">
            <a href="tel:+27824544655" className="font-medium text-[#00a4e4] hover:underline">
              +27 82 454 4655
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[#234467]">Email</dt>
          <dd className="mt-1">
            <a href="mailto:office@novecy.net" className="font-medium text-[#00a4e4] hover:underline">
              office@novecy.net
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[#234467]">WhatsApp</dt>
          <dd className="mt-1">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#6cc14a] hover:underline"
            >
              Message us on WhatsApp
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[#234467]">Physical address</dt>
          <dd className="mt-1 text-[#6d6e71]">
            Unit 22 The Station,
            <br />
            North Point, R102,
            <br />
            Ballito, 4420
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[#234467]">Trading hours</dt>
          <dd className="mt-1 text-[#6d6e71]">
            Monday - Thursday: 8am - 5pm
            <br />
            Friday: 7am - 3pm
            <br />
            Saturday &amp; Sunday: Closed
          </dd>
        </div>
      </dl>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <a
          href="mailto:office@novecy.net"
          className="font-jakarta inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#00a4e4] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0090c8]"
        >
          Email our team
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-jakarta inline-flex min-h-[44px] items-center justify-center rounded-full border-2 border-[#6cc14a] bg-[#6cc14a]/10 px-6 py-3 text-sm font-semibold text-[#234467] hover:bg-[#6cc14a]/20"
        >
          WhatsApp us
        </a>
        <Link
          href="/"
          className="font-jakarta inline-flex min-h-[44px] items-center justify-center text-sm font-semibold text-[#00a4e4] hover:underline"
        >
          ← Back to overview
        </Link>
      </div>
    </div>
  );
}
