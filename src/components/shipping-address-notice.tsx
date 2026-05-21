import Link from "next/link";

export function ShippingAddressNotice({
  contactEmail,
  addressLine,
}: {
  contactEmail: string;
  addressLine?: string | null;
}) {
  return (
    <p className="text-sm leading-relaxed text-[#6d6e71]">
      Your order will automatically be sent to the{" "}
      <strong className="text-[#234467]">approved delivery address on your profile</strong>
      {addressLine ? (
        <>
          {" "}
          (<span className="text-[#234467]">{addressLine}</span>)
        </>
      ) : null}
      . To change the shipping address for this order, please email{" "}
      <a href={`mailto:${contactEmail}`} className="font-semibold text-[#00a4e4] hover:underline">
        {contactEmail}
      </a>{" "}
      before we pack it. You can review your profile details on the{" "}
      <Link href="/portal/profile" className="font-semibold text-[#00a4e4] hover:underline">
        profile page
      </Link>
      .
    </p>
  );
}
