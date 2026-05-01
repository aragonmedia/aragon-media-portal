"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  requested: "Pending",
  approved: "Approved",
  calculated: "Calculated",
  paid: "Paid",
  rejected: "Rejected",
  late_retained: "Late · retained",
};
const STATUSES = Object.keys(STATUS_LABELS);

function centsToDollarString(cents: number): string {
  return (cents / 100).toFixed(2);
}
function dollarStringToCents(v: string): number | null {
  const cleaned = v.replace(/[^\d.\-]/g, "");
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export default function WithdrawalEditPanel({
  id,
  initial,
}: {
  id: string;
  initial: {
    grossCents: number;
    feeCents: number;
    netCents: number;
    status: string;
  };
}) {
  const router = useRouter();
  const [gross, setGross] = useState(centsToDollarString(initial.grossCents));
  const [fee, setFee] = useState(centsToDollarString(initial.feeCents));
  const [net, setNet] = useState(centsToDollarString(initial.netCents));
  const [status, setStatus] = useState(initial.status);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );

  function autoCalcNet() {
    const g = dollarStringToCents(gross);
    const f = dollarStringToCents(fee);
    if (g === null || f === null) return;
    setNet(centsToDollarString(g - f));
  }

  function autoCalcFee() {
    const g = dollarStringToCents(gross);
    const n = dollarStringToCents(net);
    if (g === null || n === null) return;
    setFee(centsToDollarString(g - n));
  }

  async function save() {
    if (busy) return;
    setMsg(null);
    const g = dollarStringToCents(gross);
    const f = dollarStringToCents(fee);
    const n = dollarStringToCents(net);
    if (g === null || f === null || n === null) {
      setMsg({ kind: "err", text: "All three amounts must be valid numbers." });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/actions/update-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          grossCents: g,
          feeCents: f,
          netCents: n,
          status,
        }),
      });
      const j = (await res.json()) as {
        ok: boolean;
        error?: string;
        emailSent?: boolean;
      };
      if (!res.ok || !j.ok) {
        setMsg({ kind: "err", text: j.error ?? "Save failed" });
        setBusy(false);
        return;
      }
      setMsg({
        kind: "ok",
        text: j.emailSent
          ? "Saved · Paid email sent to creator."
          : "Saved.",
      });
      router.refresh();
    } catch (err) {
      setMsg({
        kind: "err",
        text: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-edit-panel">
      <div className="admin-edit-grid">
        <label>
          <span>Gross (creator submitted)</span>
          <div className="admin-edit-input-group">
            <span className="admin-edit-prefix">$</span>
            <input
              className="admin-input"
              type="text"
              inputMode="decimal"
              value={gross}
              onChange={(e) => setGross(e.target.value)}
              onBlur={autoCalcNet}
              disabled={busy}
            />
          </div>
        </label>
        <label>
          <span>AM fee</span>
          <div className="admin-edit-input-group">
            <span className="admin-edit-prefix">$</span>
            <input
              className="admin-input"
              type="text"
              inputMode="decimal"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              onBlur={autoCalcNet}
              disabled={busy}
            />
          </div>
          <button
            type="button"
            className="admin-row-btn admin-edit-helper"
            onClick={autoCalcFee}
            disabled={busy}
            title="Set fee = gross − net"
          >
            ⟲ Recalculate from gross & net
          </button>
        </label>
        <label>
          <span>Net to creator</span>
          <div className="admin-edit-input-group">
            <span className="admin-edit-prefix">$</span>
            <input
              className="admin-input"
              type="text"
              inputMode="decimal"
              value={net}
              onChange={(e) => setNet(e.target.value)}
              disabled={busy}
            />
          </div>
          <button
            type="button"
            className="admin-row-btn admin-edit-helper"
            onClick={autoCalcNet}
            disabled={busy}
            title="Set net = gross − fee"
          >
            ⟲ Recalculate from gross & fee
          </button>
        </label>
        <label>
          <span>Status</span>
          <select
            className={`admin-input admin-status-select status-${status}`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={busy}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <span className="dim small">
            Changing status emails the creator with the new state.
          </span>
        </label>
      </div>

      <div className="admin-edit-actions">
        <button
          onClick={save}
          disabled={busy}
          className="admin-row-btn admin-row-btn-primary"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
        {msg && (
          <span
            className={`admin-edit-msg ${
              msg.kind === "ok" ? "admin-edit-ok" : "admin-row-err"
            }`}
          >
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
