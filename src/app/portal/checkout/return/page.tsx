import Link from "next/link";

export default function CheckoutReturnPage() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[#e0dedf] bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-[#234467]">Payment redirect</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#6d6e71]">
        If you completed payment at your bank or card gateway, confirmation is sent when we
        receive their server notification — not from this page alone. Please check your email
        or order history in a few minutes.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/portal/orders"
          className="rounded-full bg-[#00a4e4] px-4 py-2 text-sm font-semibold text-white"
        >
          View orders
        </Link>
        <Link href="/portal" className="text-sm font-medium text-[#00a4e4] underline">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
