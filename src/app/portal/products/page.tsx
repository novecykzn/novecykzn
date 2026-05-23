import { createClient } from "@/lib/supabase/server";
import { requireProvider } from "@/lib/auth/session";
import { AddLineForm } from "./add-line-form";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const query = (sp.q ?? "").trim().toLowerCase();
  const sort = sp.sort ?? "name_asc";
  const selectedCategory = (sp.category ?? "").trim();

  await requireProvider();
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  const grouped = new Map<
    string,
    {
      name: string;
      category: string;
      description: string | null;
      variants: Array<{
        id: string;
        label: string;
        priceCents: number;
        available: boolean;
      }>;
      special: boolean;
      minPrice: number;
    }
  >();

  for (const p of products ?? []) {
    const key = `${p.category}||${p.name}`;
    const strength = p.strength ? String(p.strength) : "";
    const size = p.unit_size ? String(p.unit_size) : "";
    const variantBits = [strength, size].filter(Boolean);
    const label = variantBits.length ? variantBits.join(" • ") : "Standard";
    if (!grouped.has(key)) {
      grouped.set(key, {
        name: String(p.name),
        category: String(p.category),
        description: p.description ? String(p.description) : null,
        variants: [],
        special: Boolean(p.requires_special_approval),
        minPrice: Number(p.price_cents ?? 0),
      });
    }
    const g = grouped.get(key)!;
    g.variants.push({
      id: String(p.id),
      label,
      priceCents: Number(p.price_cents ?? 0),
      available: String(p.availability_status) !== "unavailable" && Boolean(p.is_active),
    });
    g.special = g.special || Boolean(p.requires_special_approval);
    g.minPrice = Math.min(g.minPrice, Number(p.price_cents ?? 0));
  }

  function firstNumber(s: string) {
    const m = s.match(/(\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
  }

  function unitRank(s: string) {
    const v = s.toLowerCase();
    if (v.includes("mcg")) return 0;
    if (v.includes("mg")) return 1;
    if (v.includes("g")) return 2;
    if (v.includes("ml")) return 3;
    if (v.includes("l")) return 4;
    return 5;
  }

  // Ensure dropdown variants start at lowest dose/amount.
  for (const g of grouped.values()) {
    g.variants.sort((a, b) => {
      const ar = unitRank(a.label);
      const br = unitRank(b.label);
      if (ar !== br) return ar - br;
      const an = firstNumber(a.label);
      const bn = firstNumber(b.label);
      if (an !== bn) return an - bn;
      return a.label.localeCompare(b.label);
    });
  }

  let list = Array.from(grouped.values());
  const categories = Array.from(new Set(list.map((p) => p.category))).sort((a, b) =>
    a.localeCompare(b),
  );

  if (query) {
    list = list.filter((p) => {
      const haystack = [
        p.name,
        p.category,
        p.description ?? "",
        ...p.variants.map((v) => v.label),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  if (selectedCategory) {
    list = list.filter((p) => p.category === selectedCategory);
  }

  list.sort((a, b) => {
    switch (sort) {
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "category_asc":
        return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      case "category_desc":
        return b.category.localeCompare(a.category) || a.name.localeCompare(b.name);
      case "price_asc":
        return a.minPrice - b.minPrice || a.name.localeCompare(b.name);
      case "price_desc":
        return b.minPrice - a.minPrice || a.name.localeCompare(b.name);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5f8f37]">Novecy CP KZN</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#234467] sm:text-3xl">Product catalogue</h1>
      <p className="mt-2 text-sm text-[#6d6e71]">
        Professional order list — availability and pricing for registered accounts only.
      </p>

      <form className="mt-6 grid gap-3 rounded-2xl border border-[#e0dedf] bg-white p-4 shadow-sm sm:grid-cols-[1fr_240px_220px_auto] sm:items-end">
        <label className="text-xs font-medium text-[#6d6e71]">
          Search products
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Name, category, strength, size..."
            className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-[#6d6e71]">
          Category
          <select
            name="category"
            defaultValue={selectedCategory}
            className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-[#6d6e71]">
          Sort by
          <select
            name="sort"
            defaultValue={sort}
            className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm"
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="category_asc">Category (A-Z)</option>
            <option value="category_desc">Category (Z-A)</option>
            <option value="price_asc">Price (low to high)</option>
            <option value="price_desc">Price (high to low)</option>
          </select>
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-[#00a4e4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0090c8] sm:w-auto"
        >
          Apply
        </button>
      </form>
      <div className="mt-8 space-y-4">
        {list.map((p) => (
          <div
            key={`${p.category}-${p.name}`}
            className="flex flex-col gap-4 rounded-2xl border border-[#e0dedf] bg-white p-4 shadow-sm sm:flex-row sm:justify-between sm:p-6"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8c8d91]">
                {p.category}
              </p>
              <h2 className="text-lg font-semibold text-[#234467]">{p.name}</h2>
              {p.description ? (
                <p className="mt-1 text-sm text-[#6d6e71]">{p.description}</p>
              ) : null}
              <dl className="mt-3 flex flex-wrap gap-4 text-sm text-[#6d6e71]">
                <div>
                  <dt className="inline text-[#8c8d91]">Variants: </dt>
                  <dd className="inline">{p.variants.length}</dd>
                </div>
                <div>
                  <dt className="inline text-[#8c8d91]">Status: </dt>
                  <dd className="inline capitalize">
                    {p.variants.some((v) => v.available) ? "available" : "unavailable"}
                  </dd>
                </div>
                {p.special ? (
                  <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900">
                    Special approval may apply
                  </span>
                ) : null}
              </dl>
            </div>
            <div className="flex w-full flex-col items-stretch gap-3 border-t border-[#eef0f1] pt-4 sm:w-auto sm:items-start sm:border-0 sm:pt-0 sm:pl-6">
              <AddLineForm
                variants={p.variants}
                disabled={!p.variants.some((v) => v.available)}
              />
            </div>
          </div>
        ))}
      </div>
      {(list.length === 0) && (
        <p className="mt-8 text-sm text-[#8c8d91]">No active products yet.</p>
      )}
    </div>
  );
}
