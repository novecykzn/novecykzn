"use client";

import { useRef, useState } from "react";
import { uploadSignedScript } from "../actions";

export function CartScriptPanel({
  orderId,
  signedFileName,
  signedUploadedAt,
}: {
  orderId: string;
  signedFileName: string | null;
  signedUploadedAt: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState(signedFileName);
  const [uploadedAt, setUploadedAt] = useState(signedUploadedAt);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasSigned = Boolean(uploadedName && uploadedAt);

  async function downloadPdf() {
    setDownloading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/portal/orders/${orderId}/script-pdf`, {
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMessage(
          (body as { error?: string }).error ??
            "Could not download PDF. Make sure you are signed in and the cart has items.",
        );
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `novecy-order-${orderId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("Could not reach the server. Check that npm run dev is running.");
    } finally {
      setDownloading(false);
    }
  }

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setMessage("Please select your signed PDF.");
      return;
    }
    setUploading(true);
    setMessage(null);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadSignedScript(orderId, fd);
    setUploading(false);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    setUploadedName(file.name);
    setUploadedAt(new Date().toISOString());
    setMessage("Signed script uploaded. You may proceed to payment.");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="mt-8 rounded-2xl border border-[#c5e3f5] bg-[#f0f9fd] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#234467]">Signed order script (required)</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#6d6e71]">
        Novecy can only process orders with an official signed script. Download your order PDF
        (including your practice details from your application), sign it, then upload the signed
        PDF here before checkout.
      </p>

      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[#234467]">
        <li>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={downloading}
            className="font-semibold text-[#00a4e4] hover:underline disabled:opacity-60"
          >
            {downloading ? "Preparing PDF…" : "Download order PDF"}
          </button>{" "}
          — includes your name, registration, address, and line items
        </li>
        <li>Print or sign electronically, then save as a single PDF</li>
        <li>Upload the signed PDF below</li>
      </ol>

      <form onSubmit={onUpload} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-xs font-medium text-[#6d6e71]">
          Signed script (PDF only)
          <input
            ref={inputRef}
            type="file"
            name="file"
            accept="application/pdf,.pdf"
            required={!hasSigned}
            className="mt-1 w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#00a4e4] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
          />
        </label>
        <button
          type="submit"
          disabled={uploading}
          className="rounded-full border border-[#00a4e4] bg-white px-5 py-2.5 text-sm font-semibold text-[#00a4e4] hover:bg-[#e6f7fd] disabled:opacity-60"
        >
          {uploading ? "Uploading…" : hasSigned ? "Replace signed PDF" : "Upload signed PDF"}
        </button>
      </form>

      {hasSigned ? (
        <p className="mt-3 text-sm text-[#166534]">
          ✓ Signed script on file: <span className="font-medium">{uploadedName}</span>
          {uploadedAt ? (
            <span className="text-[#6d6e71]">
              {" "}
              ({new Date(uploadedAt).toLocaleString("en-ZA")})
            </span>
          ) : null}
        </p>
      ) : (
        <p className="mt-3 text-sm text-amber-900">
          Checkout is disabled until a signed script is uploaded.
        </p>
      )}

      {message ? (
        <p
          className={`mt-3 text-sm ${message.startsWith("Signed") ? "text-[#166534]" : "text-red-700"}`}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
