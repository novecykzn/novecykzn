import Link from "next/link";
import { BrandWordmark } from "@/components/brand-wordmark";
import { LoginPageClient } from "./login-page-client";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; signedOut?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="min-h-[75vh] bg-white">
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
        <div className="mb-8 flex justify-center">
          <BrandWordmark showTagline={false} />
        </div>
        <div className="rounded-2xl border border-[#e0dedf] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-[#234467]">Professional login</h1>
          <p className="mt-2 text-sm text-[#6d6e71]">
            Approved healthcare professionals only. Public visitors cannot place orders.
          </p>
          <LoginPageClient nextPath={sp.next} error={sp.error} signedOut={sp.signedOut} />
        </div>
        <p className="mt-8 text-center text-sm text-[#6d6e71]">
          Need access?{" "}
          <Link href="/apply" className="font-medium text-[#00a4e4] hover:underline">
            Apply here
          </Link>
        </p>
      </div>
    </div>
  );
}
