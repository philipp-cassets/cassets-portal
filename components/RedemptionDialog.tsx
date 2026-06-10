"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { fmtAmount, fmtNav, fmtUnits, type Denomination } from "@/lib/format";

type Readback = {
  id: string;
  ref: string;
  units: string;
  share_class: string;
  status: string;
};

/**
 * Redemption request dialog, in the report style: a hairline card over a
 * dimmed page. Three steps: form, confirmation at the latest published NAV
 * (indicative only), lodged. Dependency-free; focus is trapped while open,
 * Esc and the overlay close it.
 */
export function RedemptionDialog({
  cell,
  shareClass,
  denomination,
  unitsAvailable,
  navPerUnit,
}: {
  cell: string;
  shareClass: string;
  denomination: Denomination;
  unitsAvailable: string;
  navPerUnit: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [units, setUnits] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [readback, setReadback] = useState<Readback | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const unitsId = useId();
  const noteId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setStep(1);
    setUnits("");
    setNote("");
    setError(null);
    setBusy(false);
    setReadback(null);
  }, []);

  // Focus management: focus the first focusable element when the dialog
  // opens or the step changes; trap Tab inside; Esc closes.
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusables = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, input, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));
    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !dialog.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, step, close]);

  const unitsNum = Number(units.replace(/,/g, ""));
  const availableNum = Number(unitsAvailable);
  const navNum = Number(navPerUnit);
  const indicative = Number.isFinite(unitsNum) ? unitsNum * navNum : 0;

  const validate = (): string | null => {
    if (!units.trim() || !Number.isFinite(unitsNum) || unitsNum <= 0) {
      return "Enter a number of units greater than zero.";
    }
    if (Number.isFinite(availableNum) && unitsNum > availableNum) {
      return `You hold ${fmtUnits(unitsAvailable)} units of Class ${shareClass}.`;
    }
    return null;
  };

  const toConfirm = () => {
    const v = validate();
    setError(v);
    if (!v) setStep(2);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/redemption-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cell,
          share_class: shareClass,
          units: unitsNum,
          note: note.trim() || null,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          (data && typeof data.error === "string" && data.error) ||
            "The request could not be lodged. Please try again."
        );
        return;
      }
      setReadback(data?.request ?? null);
      setStep(3);
    } catch {
      setError("The request could not be lodged. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className="text-button" onClick={() => setOpen(true)}>
        Request redemption
      </button>

      {open && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="modal-kicker">
              {cell} · Class {shareClass}
            </div>
            <h2 id={titleId}>
              {step === 3 ? "Redemption request lodged" : "Request redemption"}
            </h2>

            {step === 1 && (
              <>
                <div className="field">
                  <label htmlFor={unitsId}>Units to redeem</label>
                  <input
                    id={unitsId}
                    inputMode="decimal"
                    autoComplete="off"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        toConfirm();
                      }
                    }}
                  />
                  <div className="helper num">
                    of {fmtUnits(unitsAvailable)} units available
                  </div>
                </div>
                <div className="field">
                  <label htmlFor={noteId}>Note to the manager (optional)</label>
                  <textarea
                    id={noteId}
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                {error && <p className="form-error">{error}</p>}
                <div className="modal-actions">
                  <button type="button" className="ghost-button" onClick={close}>
                    Cancel
                  </button>
                  <button type="button" className="primary-button" onClick={toConfirm}>
                    Continue
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="summary">
                  <div className="srow">
                    <span className="sk">Share class</span>
                    <span className="sv">
                      Class {shareClass} · {denomination}
                    </span>
                  </div>
                  <div className="srow">
                    <span className="sk">Units to redeem</span>
                    <span className="sv">{fmtUnits(unitsNum)}</span>
                  </div>
                  <div className="srow">
                    <span className="sk">Latest published NAV</span>
                    <span className="sv">{fmtNav(navPerUnit, denomination)}</span>
                  </div>
                  <div className="srow">
                    <span className="sk">Indicative proceeds</span>
                    <span className="sv">{fmtAmount(indicative, denomination)}</span>
                  </div>
                  {note.trim() && (
                    <div className="srow">
                      <span className="sk">Note</span>
                      <span className="sv">{note.trim()}</span>
                    </div>
                  )}
                </div>
                <p className="indicative-note">
                  Indicative only. Redemptions are struck at the next published
                  NAV and settled T+2.
                </p>
                {error && <p className="form-error">{error}</p>}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setStep(1)}
                    disabled={busy}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={submit}
                    disabled={busy}
                  >
                    {busy ? "Lodging..." : "Lodge request"}
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <p className="success-line">
                  Request {readback?.ref ?? ""} lodged. The manager will
                  confirm by notice.
                </p>
                <p className="success-sub num">
                  {fmtUnits(readback?.units ?? unitsNum)} units · Class{" "}
                  {readback?.share_class ?? shareClass} · Status requested
                </p>
                <div className="modal-actions">
                  <span />
                  <button type="button" className="primary-button" onClick={close}>
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
