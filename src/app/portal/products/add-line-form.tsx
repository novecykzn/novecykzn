"use client";

import { useState } from "react";
import { addLineItem } from "../actions";

export function AddLineForm({
  variants,
  disabled,
}: {
  variants: Array<{
    id: string;
    label: string;
    priceCents: number;
    available: boolean;
  }>;
  disabled?: boolean;
}) {
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMsg(null);
    const r = await addLineItem(variantId, qty);
    setLoading(false);
    if (r.error) setMsg(r.error);
    else setMsg("Added to checklist.");
  }

  const selected = variants.find((v) => v.id === variantId);
  const hasPrice = Boolean((selected?.priceCents ?? 0) > 0);
  const isUnavailable = disabled || !selected || !selected.available || !hasPrice;
  const priceText = hasPrice
    ? new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
      }).format((selected?.priceCents ?? 0) / 100)
    : "Price on request";

  return (
    <div className="w-full sm:max-w-xs">
      <p className="text-lg font-semibold text-[#234467]">{priceText}</p>
      <div className="space-y-2">
        <label className="text-xs text-[#6d6e71]">Select strength / size</label>
        <select
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className="w-full rounded-xl border border-[#d8d8d8] px-2 py-1.5 text-sm"
        >
          {variants.map((v) => (
            <option key={v.id} value={v.id} disabled={!v.available}>
              {v.label}
              {v.priceCents > 0 ? "" : " (pricing pending)"}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <label className="text-xs text-[#6d6e71]">Qty</label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="w-20 rounded-full border border-[#d8d8d8] px-2 py-1 text-sm"
        />
      </div>
      <div className="mt-3">
        <button
          type="button"
          disabled={isUnavailable || loading}
          onClick={submit}
          className="w-full rounded-full bg-[#00a4e4] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0090c8] disabled:opacity-50"
        >
          {loading ? "…" : "Add to cart"}
        </button>
      </div>
      {!hasPrice ? (
        <p className="mt-2 text-xs text-amber-700">
          This option has no published price yet. Please contact Novecy CP KZN.
        </p>
      ) : null}
      {msg ? <p className="mt-2 text-xs text-[#166534]">{msg}</p> : null}
    </div>
  );
}
