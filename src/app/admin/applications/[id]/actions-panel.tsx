"use client";

import { useState } from "react";
import {
  approveApplication,
  rejectApplication,
  setApplicationNotes,
  setApplicationStatus,
  setProviderOnAccount,
} from "../../actions";

export function ApplicationActions({
  applicationId,
  currentStatus,
  applicantUserId,
  onAccountApproved,
}: {
  applicationId: string;
  currentStatus: string;
  applicantUserId?: string | null;
  onAccountApproved?: boolean;
}) {
  const [notes, setNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [allowOnAccount, setAllowOnAccount] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onApprove() {
    setBusy(true);
    setMsg(null);
    try {
      await approveApplication(applicationId, { onAccountApproved: allowOnAccount });
      setMsg(
        allowOnAccount
          ? "Approved with on-account payment enabled."
          : "Approved. Invite email sent if mail is configured.",
      );
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Approval failed");
    }
    setBusy(false);
  }

  async function onReject() {
    setBusy(true);
    setMsg(null);
    try {
      await rejectApplication(applicationId, rejectReason || undefined);
      setMsg("Rejected and applicant notified if mail is configured.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Update failed");
    }
    setBusy(false);
  }

  async function onSaveNotes() {
    setBusy(true);
    try {
      await setApplicationNotes(applicationId, notes);
      setMsg("Notes saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    }
    setBusy(false);
  }

  async function onStatus(next: "pending" | "needs_more_info") {
    setBusy(true);
    try {
      await setApplicationStatus(applicationId, next);
      setMsg("Status updated.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Update failed");
    }
    setBusy(false);
  }

  async function onToggleOnAccount(enabled: boolean) {
    if (!applicantUserId) return;
    setBusy(true);
    setMsg(null);
    try {
      await setProviderOnAccount(applicantUserId, enabled);
      setMsg(enabled ? "On-account payment enabled." : "On-account payment disabled.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Update failed");
    }
    setBusy(false);
  }

  return (
    <div className="mt-8 rounded-2xl border border-[#e0dedf] bg-white p-4 shadow-sm sm:mt-10 sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#0077aa]">Decision</h2>
      <p className="mt-2 text-xs text-[#6d6e71]">
        Current status:{" "}
        <span className="rounded-full bg-[#e6f7fd] px-2 py-0.5 font-semibold text-[#0077aa]">
          {currentStatus}
        </span>
      </p>

      {currentStatus !== "approved" ? (
        <label className="mt-4 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={allowOnAccount}
            onChange={(e) => setAllowOnAccount(e.target.checked)}
            className="mt-1"
          />
          <span className="text-[#5c6b7a]">
            Allow <strong className="text-[#234467]">on-account</strong> ordering when approving
            (for trusted practices with existing credit terms).
          </span>
        </label>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
        <button
          type="button"
          disabled={busy || currentStatus === "approved"}
          onClick={onApprove}
          className="w-full rounded-full bg-[#00a4e4] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0090c8] disabled:opacity-50 sm:w-auto"
        >
          Approve &amp; invite
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onStatus("needs_more_info")}
          className="w-full rounded-full border border-[#d8d8d8] bg-white px-4 py-2.5 text-sm font-medium text-[#234467] transition-colors hover:border-[#00a4e4] hover:text-[#00a4e4] sm:w-auto"
        >
          Needs more info
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onStatus("pending")}
          className="w-full rounded-full border border-[#d8d8d8] bg-white px-4 py-2.5 text-sm font-medium text-[#234467] transition-colors hover:border-[#00a4e4] hover:text-[#00a4e4] sm:w-auto"
        >
          Mark pending
        </button>
      </div>

      {currentStatus === "approved" && applicantUserId ? (
        <div className="mt-6 rounded-xl border border-[#dce9c9] bg-[#fbfdf6] p-4">
          <p className="text-sm font-semibold text-[#335d1f]">On-account payment</p>
          <p className="mt-1 text-xs text-[#6d6e71]">
            Currently:{" "}
            <strong>{onAccountApproved ? "Enabled" : "Disabled"}</strong> for this professional.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || onAccountApproved}
              onClick={() => onToggleOnAccount(true)}
              className="rounded-full bg-[#5f8f37] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              Enable on-account
            </button>
            <button
              type="button"
              disabled={busy || !onAccountApproved}
              onClick={() => onToggleOnAccount(false)}
              className="rounded-full border border-[#d8d8d8] bg-white px-3 py-1.5 text-xs font-medium text-[#234467] disabled:opacity-50"
            >
              Disable on-account
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <label className="text-xs font-medium text-[#6d6e71]">Rejection reason (optional)</label>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8]"
          rows={2}
        />
        <button
          type="button"
          disabled={busy}
          onClick={onReject}
          className="mt-2 w-full rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800 sm:w-auto"
        >
          Reject application
        </button>
      </div>

      <div className="mt-8 border-t border-[#e0dedf] pt-6">
        <label className="text-xs font-medium text-[#6d6e71]">Internal notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-sm outline-none transition focus:border-[#00a4e4] focus:ring-2 focus:ring-[#bfe8f8]"
          rows={3}
          placeholder="Visible to staff only…"
        />
        <button
          type="button"
          disabled={busy}
          onClick={onSaveNotes}
          className="mt-2 w-full rounded-full bg-[#234467] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1b3654] sm:w-auto"
        >
          Save notes
        </button>
      </div>

      {msg ? <p className="mt-4 text-sm text-[#166534]">{msg}</p> : null}
    </div>
  );
}
