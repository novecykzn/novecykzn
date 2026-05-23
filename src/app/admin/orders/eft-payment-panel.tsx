"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  EFT_PAYMENT_STATUS_OPTIONS,
  type EftPaymentStatus,
  formatPaymentStatus,
} from "@/lib/payments/methods";
import { updateEftPaymentStatus } from "../actions";

export function EftPaymentPanel({
  orderId,
  currentStatus,
  eftReference,
}: {
  orderId: string;
  currentStatus: string;
  eftReference: string;
}) {
  const [status, setStatus] = useState<EftPaymentStatus>(
    (EFT_PAYMENT_STATUS_OPTIONS.some((o) => o.value === currentStatus)
      ? currentStatus
      : "awaiting_eft") as EftPaymentStatus,
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function onSave() {
    setBusy(true);
    setMsg(null);
    try {
      await updateEftPaymentStatus(orderId, status);
      setMsg("Payment status updated.");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not update.");
    }
    setBusy(false);
  }

  return (
    <div className="mt-4 rounded-xl border border-[#f5e6c8] bg-[#fffbeb] p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#92400e]">
        EFT payment tracker
      </h3>
      <p className="mt-1 text-xs text-[#6d6e71]">
        POP (proof of payment) is emailed to you. Update status when you receive and verify it.
        Set to <strong>Paid</strong> when ready for packing.
      </p>
      <p className="mt-2 font-mono text-xs text-[#234467]">
        EFT reference: <strong>{eftReference}</strong>
      </p>
      <p className="mt-1 text-xs text-[#6d6e71]">
        Current: <strong>{formatPaymentStatus(currentStatus)}</strong>
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="w-full text-xs font-medium text-[#6d6e71] sm:w-auto">
          Payment status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EftPaymentStatus)}
            className="mt-1 block w-full rounded-xl border border-[#d8d8d8] bg-white px-3 py-2 text-sm sm:min-w-[220px]"
          >
            {EFT_PAYMENT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={onSave}
          className="w-full rounded-full bg-[#92400e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#78350f] disabled:opacity-60 sm:w-auto"
        >
          {busy ? "Saving…" : "Update payment status"}
        </button>
      </div>
      {msg ? <p className="mt-2 text-xs text-[#166534]">{msg}</p> : null}
    </div>
  );
}
