"use client";

import { useActionState } from "react";
import { submitApplication, type SubmitApplicationState } from "./actions";

const roles = [
  { value: "doctor", label: "Doctor" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "clinic", label: "Clinic" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "other", label: "Other" },
];

const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

const initial: SubmitApplicationState = {};

export function ApplyForm() {
  const [state, formAction, pending] = useActionState(submitApplication, initial);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] px-6 py-8 text-[#166534] shadow-sm">
        <h2 className="text-lg font-semibold">Application received</h2>
        <p className="mt-2 text-sm leading-relaxed">
          Thank you. Our compliance team will review your details. A confirmation has been
          sent to your email address if mail delivery is configured.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border border-[#e0dedf] bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Full name"
          name="full_name"
          required
          error={state.fieldErrors?.full_name}
        />
        <Field
          label="Practice / pharmacy / company name"
          name="company_name"
          required
          error={state.fieldErrors?.company_name}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#5c6b7a]">Your role</label>
        <select
          name="role"
          required
          className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8]"
          defaultValue=""
        >
          <option value="" disabled>
            Select…
          </option>
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.role ? (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.role}</p>
        ) : null}
      </div>

      <Field
        label="HPCSA / SAPC / practice registration number"
        name="registration_number"
        required
        error={state.fieldErrors?.registration_number}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Work email"
          name="email"
          type="email"
          required
          error={state.fieldErrors?.email}
        />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          required
          error={state.fieldErrors?.phone}
        />
      </div>

      <Field label="Street address" name="address" required error={state.fieldErrors?.address} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="City" name="city" required error={state.fieldErrors?.city} />
        <div>
          <label className="block text-xs font-medium text-[#5c6b7a]">Province</label>
          <select
            name="province"
            required
            className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8]"
            defaultValue=""
          >
            <option value="" disabled>
              Select…
            </option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {state.fieldErrors?.province ? (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.province}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#5c6b7a]">
          Supporting documents (PDF, images)
        </label>
        <input
          type="file"
          name="documents"
          multiple
          accept=".pdf,image/*"
          className="mt-1 w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#00a4e4] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
        />
        <p className="mt-1 text-xs text-[#94a3b8]">Registration certificates, practice letter, etc.</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#5c6b7a]">Notes / message</label>
        <textarea
          name="notes"
          rows={4}
          className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8]"
          placeholder="Optional context for reviewers…"
        />
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span className="text-[#5c6b7a]">
          I confirm that I am authorised to apply for professional ordering access on behalf
          of the practice or pharmacy named above.
        </span>
      </label>
      {state.fieldErrors?.consent ? (
        <p className="text-xs text-red-600">{state.fieldErrors.consent}</p>
      ) : null}

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[#00a4e4] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0090c8] disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#5c6b7a]">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8]"
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
