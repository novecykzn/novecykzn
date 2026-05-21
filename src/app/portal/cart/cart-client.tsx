"use client";

import { useState } from "react";
import { removeLineItem, updateLineQuantity } from "../actions";

type Item = {
  id: string;
  name: string;
  quantity: number;
  unit: number;
  total: number;
};

function formatZar(cents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(cents / 100);
}

export function CartClient({ items }: { items: Item[] }) {
  return (
    <ul className="mt-6 space-y-4">
      {items.map((i) => (
        <Line key={i.id} item={i} />
      ))}
    </ul>
  );
}

function Line({ item }: { item: Item }) {
  const [qty, setQty] = useState(item.quantity);
  const [busy, setBusy] = useState(false);

  async function saveQty() {
    setBusy(true);
    await updateLineQuantity(item.id, qty);
    setBusy(false);
  }

  async function remove() {
    setBusy(true);
    await removeLineItem(item.id);
    setBusy(false);
  }

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-[#e0dedf] bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-[#234467]">{item.name}</p>
        <p className="text-xs text-[#8c8d91]">Unit {formatZar(item.unit)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="w-16 rounded border border-[#d8d8d8] px-2 py-1 text-sm"
        />
        <button
          type="button"
          disabled={busy}
          onClick={saveQty}
          className="text-sm font-medium text-[#00a4e4] hover:underline"
        >
          Update
        </button>
        <p className="text-sm font-semibold text-[#234467]">{formatZar(item.total)}</p>
        <button
          type="button"
          disabled={busy}
          onClick={remove}
          className="text-sm text-red-700 hover:underline"
        >
          Remove
        </button>
      </div>
    </li>
  );
}
