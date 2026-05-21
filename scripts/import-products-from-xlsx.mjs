import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const xlsxPath = process.argv[2];
if (!xlsxPath) {
  console.error("Usage: node scripts/import-products-from-xlsx.mjs <xlsx-path>");
  process.exit(1);
}

const envPath = path.join(process.cwd(), ".env.local");
const envRaw = fs.readFileSync(envPath, "utf8");
for (const line of envRaw.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const idx = line.indexOf("=");
  if (idx < 0) continue;
  const k = line.slice(0, idx).trim();
  const v = line.slice(idx + 1).trim();
  if (!process.env[k]) process.env[k] = v;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing Supabase env vars.");
}

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const colToIndex = (col) => {
  let n = 0;
  for (const ch of col) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
};

function parseFromExtracted(baseDir) {
  const sharedXml = fs.readFileSync(path.join(baseDir, "xl/sharedStrings.xml"), "utf8");
  const sheetXml = fs.readFileSync(path.join(baseDir, "xl/worksheets/sheet1.xml"), "utf8");

  const sst = [...sharedXml.matchAll(/<x:si>([\s\S]*?)<\/x:si>/g)].map((m) => {
    const parts = [...m[1].matchAll(/<x:t[^>]*>([\s\S]*?)<\/x:t>/g)].map((x) => x[1]);
    return decode(parts.join(""));
  });

  const rows = [];
  for (const rm of sheetXml.matchAll(/<x:row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/x:row>/g)) {
    const rnum = Number(rm[1]);
    const body = rm[2];
    const cells = {};
    for (const cm of body.matchAll(/<x:c[^>]*r="([A-Z]+)(\d+)"([^>]*)>([\s\S]*?)<\/x:c>/g)) {
      const col = cm[1];
      const attrs = cm[3];
      const inner = cm[4];
      let val = "";
      const v = inner.match(/<x:v>([\s\S]*?)<\/x:v>/);
      if (v) {
        if (/t="s"/.test(attrs)) val = sst[Number(v[1])] ?? "";
        else val = v[1];
      }
      cells[col] = decode(val);
    }
    if (Object.keys(cells).length) rows.push({ rnum, cells });
  }

  if (!rows.length) return [];
  const header = rows[0];
  const orderedCols = Object.entries(header.cells).sort((a, b) => colToIndex(a[0]) - colToIndex(b[0]));
  const headers = orderedCols.map(([, h]) => h.trim());

  const out = [];
  for (const row of rows.slice(1)) {
    const rec = {};
    orderedCols.forEach(([col], i) => {
      rec[headers[i]] = (row.cells[col] ?? "").trim();
    });
    if (Object.values(rec).every((v) => !String(v).trim())) continue;
    out.push(rec);
  }
  return out;
}

function toCents(v) {
  const n = Number(String(v).replace(/,/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function mapAvailability(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("discontinued") || s.includes("unavailable") || s.includes("hold")) return "unavailable";
  return "available";
}

async function main() {
  const extracted = path.join(process.cwd(), ".tmp_import_xlsx_extracted");
  fs.rmSync(extracted, { recursive: true, force: true });
  fs.mkdirSync(extracted, { recursive: true });
  const { execSync } = await import("child_process");
  execSync(`unzip -q "${xlsxPath}" -d "${extracted}"`);

  const rows = parseFromExtracted(extracted);
  if (!rows.length) throw new Error("No rows parsed from sheet1.");

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const payload = rows.map((r) => {
    const name = r["Product / Ingredient"] || "Unnamed product";
    const fullDesc = r["Full Formulation Description"] || "";
    const dosageForm = r["Dosage Form"] || "";
    const primaryCategory = r["Primary Clinical Category"] || "General";
    const secondary = r["Secondary Clinical Categories"] || "";
    const unitSize = r["Pack Size"] || "Unit";
    const inclVat = r["Incl. VAT"] || r["Excl. VAT"] || "0";
    const search = r["Search Keywords"] || "";
    const notes = r["Status / Hannah Notes"] || "";
    const prescription = (r["Prescription Required"] || "").toLowerCase();

    return {
      name,
      category: primaryCategory,
      description: [fullDesc && `Strength: ${fullDesc}`, dosageForm && `Dosage form: ${dosageForm}`, secondary && `Secondary: ${secondary}`, search && `Keywords: ${search}`]
        .filter(Boolean)
        .join(" | "),
      strength: fullDesc || null,
      unit_size: unitSize,
      price_cents: toCents(inclVat),
      currency: "ZAR",
      availability_status: mapAvailability(notes),
      requires_special_approval: prescription === "yes",
      is_active: true,
    };
  });

  // Replace catalogue with imported products.
  const { error: delErr } = await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) throw delErr;

  const batchSize = 200;
  for (let i = 0; i < payload.length; i += batchSize) {
    const chunk = payload.slice(i, i + batchSize);
    const { error } = await supabase.from("products").insert(chunk);
    if (error) throw error;
  }

  console.log(`Imported ${payload.length} product rows from workbook.`);
  fs.rmSync(extracted, { recursive: true, force: true });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
