import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Healthcare professionals",
};

export default function ForProvidersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="font-jakarta text-center text-xs font-bold uppercase tracking-[0.22em] text-[#5f8f37]">Novecy CP KZN</p>
      <h1 className="font-nunito mt-3 text-center text-3xl font-bold text-[#234467] sm:text-4xl">
        For healthcare professionals
      </h1>
      <div className="font-jakarta mx-auto mt-6 max-w-3xl space-y-4 text-center leading-relaxed text-[#6d6e71]">
        <p>
          Novecy CP KZN is structured to support registered healthcare professionals seeking access
          to high-quality pharmaceutical compounding within a controlled and professionally
          governed environment.
        </p>
        <p>
          Practitioner-only resources, pricing and ordering access are reserved for approved
          users. The public-facing site provides general information and contact access, while the
          professional side is designed to support registered prescribers and healthcare partners
          more directly.
        </p>
        <p>
          Whether supporting individual prescriptions, practice requirements or ongoing
          professional relationships, Novecy CP KZN works alongside healthcare professionals with
          a focus on responsiveness, discretion and professional standards.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/auth/login" className="font-jakarta inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#00a4e4] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0090c8]">
          Healthcare professional access
        </Link>
        <Link href="/contact" className="font-jakarta inline-flex min-h-[44px] items-center justify-center rounded-full border-2 border-[#7dac4a]/45 bg-white px-6 py-3 text-sm font-semibold text-[#335d1f] hover:border-[#5f8f37] hover:bg-[#f6fbe9]">
          Contact our team
        </Link>
      </div>
      <p className="font-jakarta mt-8 text-center text-sm text-[#6d6e71]">
        Need a new account?{" "}
        <Link href="/apply" className="font-semibold text-[#00a4e4] hover:underline">
          Apply for portal access
        </Link>
        .
      </p>
    </div>
  );
}
