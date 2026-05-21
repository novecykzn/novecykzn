import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import type { ProviderOrderDetails } from "./provider-details";

export type OrderLineForPdf = {
  name: string;
  quantity: number;
  unitCents: number;
  totalCents: number;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function formatZar(cents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(cents / 100);
}

function capitalizeRole(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function wrapLines(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

class PdfWriter {
  private page: PDFPage;
  private y: number;
  private readonly regular: PDFFont;
  private readonly bold: PDFFont;

  constructor(
    private readonly doc: PDFDocument,
    regular: PDFFont,
    bold: PDFFont,
  ) {
    this.regular = regular;
    this.bold = bold;
    this.page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  private ensureSpace(lines = 1) {
    if (this.y - lines * 14 < MARGIN) {
      this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      this.y = PAGE_HEIGHT - MARGIN;
    }
  }

  text(content: string, opts?: { bold?: boolean; size?: number; gap?: number }) {
    const size = opts?.size ?? 10;
    const font = opts?.bold ? this.bold : this.regular;
    const gap = opts?.gap ?? 4;
    for (const line of wrapLines(content, font, size, CONTENT_WIDTH)) {
      this.ensureSpace();
      this.page.drawText(line, {
        x: MARGIN,
        y: this.y,
        size,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      this.y -= size + gap;
    }
  }

  spacer(px = 12) {
    this.y -= px;
  }
}

export async function buildOrderScriptPdf(params: {
  orderId: string;
  provider: ProviderOrderDetails;
  lines: OrderLineForPdf[];
  totalCents: number;
  createdAt: Date;
}): Promise<Buffer> {
  const { orderId, provider, lines, totalCents, createdAt } = params;

  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const w = new PdfWriter(doc, regular, bold);

  w.text("Novecy CP KZN", { bold: true, size: 18, gap: 6 });
  w.text("Professional compounding order — official script", { size: 11, gap: 8 });
  w.spacer(8);
  w.text(`Order reference: ${orderId}`);
  w.text(
    `Date: ${createdAt.toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })}`,
  );
  w.spacer(12);

  w.text("Prescriber / practice details", { bold: true, size: 12, gap: 8 });
  const details: [string, string][] = [
    ["Full name", provider.fullName],
    ["Organisation", provider.companyName],
    ["Role", capitalizeRole(provider.practiceRole)],
    ["HPCSA / SAPC / registration no.", provider.registrationNumber],
    ["Email", provider.email],
    ["Phone", provider.phone],
    ["Address", `${provider.address}, ${provider.city}, ${provider.province}`],
  ];
  for (const [label, value] of details) {
    w.text(`${label}: ${value}`);
  }
  w.spacer(12);

  w.text("Order lines", { bold: true, size: 12, gap: 8 });
  for (const line of lines) {
    w.text(
      `${line.name} — Qty ${line.quantity} — Unit ${formatZar(line.unitCents)} — Line ${formatZar(line.totalCents)}`,
    );
  }
  w.spacer(8);
  w.text(`Estimated order total: ${formatZar(totalCents)}`, { bold: true, size: 11 });
  w.text("Pricing is indicative until payment is confirmed. VAT per your professional agreement.", {
    size: 9,
    gap: 6,
  });
  w.spacer(16);

  w.text("Authorisation", { bold: true, size: 11, gap: 8 });
  w.text(
    "I confirm that this order is authorised by me as the registered healthcare professional named above, " +
      "and that the products listed are requested for legitimate professional/compounding purposes in line with applicable regulations.",
  );
  w.spacer(16);
  w.text("Signature: _________________________________");
  w.text("Date signed: _________________________________");
  w.text("Print name: _________________________________");
  w.spacer(12);
  w.text(
    "After signing, scan or photograph this document as a single PDF and upload it in the portal cart before payment. " +
      "Orders without a signed script will not be processed.",
    { size: 8 },
  );

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
