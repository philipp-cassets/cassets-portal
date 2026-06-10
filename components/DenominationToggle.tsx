"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "cassets-denom";

type Denom = "USD" | "NEAR";

/**
 * The portal's most important control: a labelled USD / NEAR switch.
 *
 * It NEVER converts anything. Every money figure on the page is tagged
 * .denom-usd or .denom-near at render time; this control only sets
 * html[data-denom], which the stylesheet uses to foreground the chosen
 * denomination and hold the other at ghost opacity. Flipping triggers a
 * single synchronized "re-print" (blur + fade) of every tagged numeral.
 *
 * The choice persists to localStorage and is restored by the pre-paint
 * script in the layout. Default is USD.
 */
export function DenominationToggle() {
  // null until mounted so the server and first client render agree.
  const [denom, setDenom] = useState<Denom | null>(null);
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const d = document.documentElement.dataset.denom;
    setDenom(d === "NEAR" ? "NEAR" : "USD");
    return () => {
      if (flipTimer.current) clearTimeout(flipTimer.current);
    };
  }, []);

  function flip() {
    const next: Denom = denom === "NEAR" ? "USD" : "NEAR";
    setDenom(next);
    const root = document.documentElement;
    // Re-print: blur every tagged figure, swap the foreground, settle.
    root.classList.add("denom-flip");
    root.dataset.denom = next;
    if (flipTimer.current) clearTimeout(flipTimer.current);
    flipTimer.current = setTimeout(() => {
      root.classList.remove("denom-flip");
    }, 180);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode etc.; the choice simply will not persist.
    }
  }

  const isNear = denom === "NEAR";

  return (
    <button
      type="button"
      className="denom-toggle"
      onClick={flip}
      role="switch"
      aria-checked={isNear}
      aria-label="Denomination: foreground USD or NEAR figures. Figures are never converted."
    >
      <span className={`dt-label${!isNear ? " active" : ""}`}>USD</span>
      <span className={`dt-track${isNear ? " on" : ""}`} aria-hidden="true">
        <span className="dt-knob" />
      </span>
      <span className={`dt-label${isNear ? " active" : ""}`}>NEAR</span>
    </button>
  );
}
