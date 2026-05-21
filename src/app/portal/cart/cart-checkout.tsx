"use client";

import { useState } from "react";
import { EftInstructionsPanel, type EftBankDetailsDisplay } from "@/components/eft-instructions-panel";
import type { PaymentMethod } from "@/lib/payments/methods";
import { submitCheckout } from "../actions";

export function CartCheckout({
  orderId,
  onAccountAvailable,
  totalZar,
  contactEmail,
  addressLine,
  bank,
  bankUsingPlaceholders,
}: {
  orderId: string;
  onAccountAvailable: boolean;
  totalZar: string;
  contactEmail: string;
  addressLine?: string | null;
  bank: EftBankDetailsDisplay;
  bankUsingPlaceholders: boolean;
}) {
  const [method, setMethod] = useState<PaymentMethod>("online");
  const orderReference = orderId.slice(0, 8).toUpperCase();

  return (
    <form action={submitCheckout} className="mt-6 w-full max-w-2xl">
      <input type="hidden" name="orderId" value={orderId} />
      <fieldset>
        <legend className="text-sm font-semibold text-[#234467]">Payment method</legend>
        <div className="mt-3 space-y-3">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-[#e0dedf] bg-white p-4 has-[:checked]:border-[#00a4e4] has-[:checked]:ring-2 has-[:checked]:ring-[#bfe8f8]">
            <input
              type="radio"
              name="paymentMethod"
              value="online"
              checked={method === "online"}
              onChange={() => setMethod("online")}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-semibold text-[#234467]">Online payment</span>
              <span className="mt-0.5 block text-xs text-[#6d6e71]">
                Card payment via secure gateway — confirmation when the gateway notifies us.
              </span>
            </span>
          </label>

          <div className="space-y-3">
            <label className="flex cursor-pointer gap-3 rounded-xl border border-[#e0dedf] bg-white p-4 has-[:checked]:border-[#00a4e4] has-[:checked]:ring-2 has-[:checked]:ring-[#bfe8f8]">
              <input
                type="radio"
                name="paymentMethod"
                value="eft"
                checked={method === "eft"}
                onChange={() => setMethod("eft")}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold text-[#234467]">EFT / bank transfer</span>
                <span className="mt-0.5 block text-xs text-[#6d6e71]">
                  Pay by EFT, email POP with subject &quot;Order {orderReference}&quot;, then we
                  pack your order.
                </span>
              </span>
            </label>

            {method === "eft" ? (
              <EftInstructionsPanel
                orderReference={orderReference}
                totalZar={totalZar}
                contactEmail={contactEmail}
                addressLine={addressLine}
                bank={bank}
                showPlaceholdersNote={bankUsingPlaceholders}
                compact
              />
            ) : null}
          </div>

          {onAccountAvailable ? (
            <label className="flex cursor-pointer gap-3 rounded-xl border border-[#dce9c9] bg-[#fbfdf6] p-4 has-[:checked]:border-[#5f8f37] has-[:checked]:ring-2 has-[:checked]:ring-[#dce9c9]">
              <input
                type="radio"
                name="paymentMethod"
                value="on_account"
                checked={method === "on_account"}
                onChange={() => setMethod("on_account")}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold text-[#335d1f]">On account</span>
                <span className="mt-0.5 block text-xs text-[#6d6e71]">
                  For approved professionals only. Your order will be submitted to our team for
                  fulfilment on account.
                </span>
              </span>
            </label>
          ) : (
            <p className="rounded-xl border border-dashed border-[#d8d8d8] bg-[#f9fafb] px-4 py-3 text-xs text-[#6d6e71]">
              <strong className="text-[#234467]">On account</strong> is not enabled for your
              practice. Contact Novecy CP KZN if you need account terms.
            </p>
          )}
        </div>
      </fieldset>

      <button
        type="submit"
        className="mt-6 rounded-full bg-[#00a4e4] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0090c8]"
      >
        {method === "online"
          ? "Continue to online payment"
          : method === "eft"
            ? "Submit EFT order"
            : "Submit order on account"}
      </button>
    </form>
  );
}
