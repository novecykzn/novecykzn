import type { Metadata } from "next";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = {
  title: "Apply for Access",
};

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="font-jakarta text-center text-xs font-bold uppercase tracking-[0.22em] text-[#5f8f37]">
        Novecy CP KZN
      </p>
      <h1 className="mt-3 text-center text-3xl font-semibold text-[#234467]">Apply for portal access</h1>
      <p className="mt-4 text-center leading-relaxed text-[#5c6b7a]">
        Complete this form so we can verify your professional registration. Only approved
        accounts may view pricing and place orders. This site does not sell to the public.
      </p>
      <div className="mt-10">
        <ApplyForm />
      </div>
    </div>
  );
}
