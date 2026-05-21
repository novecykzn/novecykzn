import Link from "next/link";

export default function PendingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-2xl border border-[#d6deea] bg-gradient-to-br from-[#eef6fd] via-white to-[#f4faf8] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#234467]">Account pending approval</h1>
        <p className="mt-4 text-[#5c6b7a] leading-relaxed">
          Your profile is registered but not yet cleared for ordering. If you recently
          submitted an application, our team will contact you after review. Approved
          prescribers and pharmacies receive portal access by email.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/apply" className="rounded-full bg-[#00a4e4] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0090c8]">
          View application
        </Link>
        <Link href="/contact" className="rounded-full border border-[#7dac4a]/45 bg-white px-5 py-2 text-sm font-semibold text-[#335d1f] hover:bg-[#f6fbe9]">
          Contact the lab
        </Link>
      </div>
    </div>
  );
}
