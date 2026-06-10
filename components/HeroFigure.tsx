"use client";

import { useEffect, useState } from "react";
import type { Denomination } from "@/lib/format";

/**
 * The 72px/600 hero figure with ghost decimals, per the handoff: integer
 * part in ink, fractional part at --ghost, NEAR carrying a lighter " NEAR"
 * suffix and never a "$". On mount the numerals count up from 0 over 0.9s
 * expo-out after a 350ms delay (skipped under prefers-reduced-motion);
 * the server renders the settled figure so nothing jumps without JS.
 */
export function HeroFigure({
  value,
  denomination,
}: {
  value: string;
  denomination: Denomination;
}) {
  const target = Number(value);
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (!Number.isFinite(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target);
      return;
    }
    const DURATION = 900;
    const DELAY = 350;
    let raf = 0;
    let start: number | undefined;
    let done = false;
    const tick = (t: number) => {
      if (start === undefined) start = t;
      const el = Math.max(0, t - start - DELAY);
      const k = Math.min(1, el / DURATION);
      const e = 1 - Math.pow(2, -10 * k); // expo-out
      setDisplay(k >= 1 ? target : target * e);
      if (k < 1) raf = requestAnimationFrame(tick);
      else done = true;
    };
    setDisplay(0);
    raf = requestAnimationFrame(tick);
    // fallback: if rAF is throttled (hidden tab), snap to target
    const snap = setTimeout(() => {
      if (!done) setDisplay(target);
    }, DELAY + DURATION + 200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(snap);
    };
  }, [target]);

  if (!Number.isFinite(target)) {
    return <div className="figure tnum">{value}</div>;
  }

  const s = display.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [int, dec] = s.split(".");
  const denomClass = denomination === "NEAR" ? "denom-near" : "denom-usd";

  return (
    <div className={`figure tnum ${denomClass}`}>
      {denomination === "USD" ? "$ " : ""}
      {int}
      <span className="ghost">.{dec}</span>
      {denomination === "NEAR" && <span className="suffix">NEAR</span>}
    </div>
  );
}
