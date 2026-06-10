"use client";

import { useState } from "react";
import { fmtDate, fmtNav, type Denomination } from "@/lib/format";

type Point = { date: string; value: number };
type Hover = { idx: number; x: number; y: number };

/**
 * The signature visualization: a band of thin vertical strokes, one per
 * published NAV, heights encoding NAV-per-unit history. Warm gray ramp,
 * lighter on the left, darkest at the most recent stroke. No axes, no
 * gridlines, no dots. Strokes grow from the baseline on load (staggered
 * left to right); hovering lifts the stroke under the cursor plus its
 * neighbors to full ink and shows a minimal tooltip.
 *
 * The tooltip prints NAV/unit in the share class's own denomination;
 * the portal toggle never converts it.
 */
export function BarcodeChart({
  series,
  denomination,
  startLabel,
  endLabel,
  segmentLabel,
  segmentSub,
}: {
  series: Point[];
  denomination: Denomination;
  startLabel?: string;
  endLabel?: string;
  segmentLabel?: string;
  segmentSub?: string;
}) {
  const [hover, setHover] = useState<Hover | null>(null);

  const real = series.filter((p) => Number.isFinite(p.value));
  if (real.length < 2) return null;

  // Density: the band should read as a barcode of hundreds of strokes.
  // Published NAVs can be sparse, so interpolate display-only strokes
  // between consecutive points. The tooltip always snaps back to the
  // nearest REAL published NAV - no invented figures are ever printed.
  const UP = Math.max(1, Math.ceil(280 / real.length));
  const points: (Point & { realIdx: number })[] = [];
  for (let i = 0; i < real.length - 1; i++) {
    for (let k = 0; k < UP; k++) {
      const t = k / UP;
      points.push({
        date: real[i].date,
        value: real[i].value + (real[i + 1].value - real[i].value) * t,
        realIdx: t < 0.5 ? i : i + 1,
      });
    }
  }
  points.push({ ...real[real.length - 1], realIdx: real.length - 1 });
  const n = points.length;

  const H = 240;
  const PITCH = 5;
  const W = n * PITCH;

  const min = Math.min(...points.map((p) => p.value));
  const max = Math.max(...points.map((p) => p.value));
  const span = max - min || 1;

  // Heights keep a visible floor so the band reads as a barcode, not a
  // skyline collapsing to zero.
  const topY = (v: number) => {
    const norm = (v - min) / span;
    return H * (1 - (0.18 + 0.82 * norm));
  };

  const first = real[0].value;
  const last = real[real.length - 1].value;

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const idx = Math.max(0, Math.min(n - 1, Math.floor((x / rect.width) * n)));
    setHover({ idx, x, y: e.clientY - rect.top });
  }

  // The printed tooltip is always a real published NAV.
  const hovered = hover ? real[points[hover.idx].realIdx] : null;

  return (
    <div className="barcode-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Published NAV per unit, ${real.length} published NAVs, from ${fmtNav(
          first,
          denomination
        )} to ${fmtNav(last, denomination)}`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {points.map((p, i) => {
          const lifted = hover !== null && Math.abs(i - hover.idx) <= 3;
          const alpha = lifted ? 0.95 : 0.25 + 0.3 * (i / (n - 1));
          return (
            <line
              key={p.date + i}
              className="bar-stroke"
              x1={i * PITCH + PITCH / 2}
              x2={i * PITCH + PITCH / 2}
              y1={H}
              y2={topY(p.value)}
              stroke={`rgba(var(--bar-ink), ${alpha.toFixed(2)})`}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              style={{ animationDelay: `${(0.6 + i * 0.0012).toFixed(4)}s` }}
            />
          );
        })}
      </svg>

      {hovered && hover && (
        <div
          className="barcode-tip"
          style={{
            left: hover.x + 14,
            top: Math.max(hover.y - 48, 0),
          }}
        >
          <div className="tip-date">{fmtDate(hovered.date)}</div>
          <div className="tip-value num">{fmtNav(hovered.value, denomination)}</div>
        </div>
      )}

      <div className="barcode-foot">
        <span className="num">
          {startLabel}
          {startLabel ? " · " : ""}
          {fmtNav(first, denomination)}
        </span>
        {segmentLabel && (
          <span className="seg">
            <b>{segmentLabel}</b>
            {segmentSub}
          </span>
        )}
        <span className="num">
          {endLabel}
          {endLabel ? " · " : ""}
          {fmtNav(last, denomination)}
        </span>
      </div>
    </div>
  );
}
