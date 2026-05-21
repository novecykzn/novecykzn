import { ShippingAddressNotice } from "@/components/shipping-address-notice";

export type EftBankDetailsDisplay = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
};

export function EftInstructionsPanel({
  orderReference,
  totalZar,
  contactEmail,
  addressLine,
  bank,
  showPlaceholdersNote = false,
  compact = false,
}: {
  orderReference: string;
  totalZar: string;
  contactEmail: string;
  addressLine?: string | null;
  bank: EftBankDetailsDisplay;
  showPlaceholdersNote?: boolean;
  compact?: boolean;
}) {
  const emailSubject = `Order ${orderReference}`;
  const mailtoHref = `mailto:${contactEmail}?subject=${encodeURIComponent(emailSubject)}`;

  return (
    <div
      className={`rounded-xl border border-[#c5e3f5] bg-[#f0f9fd] ${compact ? "p-4" : "p-6"}`}
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#0077aa]">
        EFT payment instructions
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6d6e71]">
        Pay by EFT using the details below, then email your proof of payment (POP). Once we
        confirm payment, your order will be packed and sent to your approved profile address.
      </p>

      {showPlaceholdersNote ? (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Banking details below are placeholders until live account information is configured.
        </p>
      ) : null}

      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[#234467]">
        <li>
          Transfer <strong>{totalZar}</strong> using the banking details below.
        </li>
        <li>
          Use payment reference:{" "}
          <span className="font-mono font-semibold text-[#0077aa]">{orderReference}</span>
        </li>
        <li>
          Email your POP to{" "}
          <a href={mailtoHref} className="font-semibold text-[#00a4e4] hover:underline">
            {contactEmail}
          </a>
        </li>
      </ol>

      <div className="mt-4 rounded-lg border border-[#e0dedf] bg-white p-4 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8c8d91]">
          Email subject line (use exactly)
        </p>
        <p className="mt-1 font-mono text-base font-semibold text-[#0077aa]">{emailSubject}</p>
        <p className="mt-2 text-xs text-[#6d6e71]">
          Attach your bank proof of payment. Include your practice name in the email body if
          helpful.
        </p>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[#8c8d91]">Amount</dt>
          <dd className="font-semibold text-[#234467]">{totalZar}</dd>
        </div>
        <div>
          <dt className="text-[#8c8d91]">Payment reference</dt>
          <dd className="font-mono font-semibold text-[#0077aa]">{orderReference}</dd>
        </div>
        <div>
          <dt className="text-[#8c8d91]">Bank</dt>
          <dd className="font-medium text-[#234467]">{bank.bankName}</dd>
        </div>
        <div>
          <dt className="text-[#8c8d91]">Account name</dt>
          <dd className="font-medium text-[#234467]">{bank.accountName}</dd>
        </div>
        <div>
          <dt className="text-[#8c8d91]">Account number</dt>
          <dd className="font-mono font-medium text-[#234467]">{bank.accountNumber}</dd>
        </div>
        <div>
          <dt className="text-[#8c8d91]">Branch code</dt>
          <dd className="font-mono font-medium text-[#234467]">{bank.branchCode}</dd>
        </div>
        <div>
          <dt className="text-[#8c8d91]">Account type</dt>
          <dd className="font-medium text-[#234467]">{bank.accountType}</dd>
        </div>
        <div>
          <dt className="text-[#8c8d91]">Email POP to</dt>
          <dd>
            <a href={`mailto:${contactEmail}`} className="font-medium text-[#00a4e4] hover:underline">
              {contactEmail}
            </a>
          </dd>
        </div>
      </dl>

      {!compact ? (
        <div className="mt-4 rounded-lg border border-[#e0dedf] bg-[#f9fbfc] px-3 py-3">
          <ShippingAddressNotice contactEmail={contactEmail} addressLine={addressLine} />
        </div>
      ) : null}
    </div>
  );
}
