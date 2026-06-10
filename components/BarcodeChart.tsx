"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { fmtNav, type Denomination } from "@/lib/format";

type Point = { date: string; value: number };
type Hover = { idx: number; x: number; y: number };

/**
 * The signature barcode curtain, per the handoff: 2px vertical strokes at
 * 6px pitch anchored to a common TOP baseline, hanging down 55-100% of a
 * 300px band inside a 390px block. Each stroke is a vertical gradient
 * rgba(60,56,46,0.55) -> transparent; the middle calendar segment carries
 * an olive cast, the right segment is lightest. 1px ink divider verticals
 * run the full 390px with name-over-share label pairs beneath the band.
 * Hover deepens the stroke plus 3 neighbours each side to ink over 150ms
 * and shows a minimal white tooltip (small-caps date + 15px/600 value).
 *
 * Published NAVs can be sparse, so the series is resampled to one stroke
 * per 6px of width; the tooltip always snaps to the nearest REAL published
 * NAV - no invented figures are ever printed. Dividers fall on real
 * calendar month boundaries and the per-segment label shows that month's
 * NAV change, derived from the same published series.
 */

const BAND_H = 300;
const SVG_H = 390;
const PITCH = 6;
const STROKE_W = 2;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseDate(d: string): Date {
  return new Date(`${d.slice(0, 10)}T00:00:00Z`);
}

export function BarcodeChart({
  series,
  denomination,
}: {
  series: Point[];
  denomination: Denomination;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<Hover | null>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((es) => setWidth(es[0].contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const real = useMemo(
    () => series.filter((p) => Number.isFinite(p.value)),
    [series]
  );

  const n = Math.max(0, Math.floor(width / PITCH));
  const m = real.length;

  const { strokes, dividers, labels } = useMemo(() => {
    if (n < 2 || m < 2) {
      return {
        strokes: [] as { x: number; len: number; tone: string; realIdx: number; i: number }[],
        dividers: [] as number[],
        labels: [] as { name: string; share: string; left: number }[],
      };
    }

    const min = Math.min(...real.map((p) => p.value));
    const max = Math.max(...real.map((p) => p.value));
    const span = max - min || 1;

    // Calendar month boundaries within the published series; the last two
    // become divider rules so the band reads as three segments at most.
    const allBounds: number[] = [];
    for (let j = 1; j < m; j++) {
      if (parseDate(real[j].date).getUTCMonth() !== parseDate(real[j - 1].date).getUTCMonth()) {
        allBounds.push(j);
      }
    }
    const bounds = allBounds.slice(-2);
    const divX = bounds.map((j) => Math.round(((j / (m - 1)) * (n - 1)) * PITCH));

    const segStarts = [0, ...bounds];
    const segEnds = [...bounds, m - 1];
    const tones = ["default", "olive", "light"];

    const segLabels = segStarts.map((s, k) => {
      const e = segEnds[k];
      const startVal = real[s].value;
      const endVal = real[e].value;
      const pct = startVal !== 0 ? (endVal / startVal - 1) * 100 : 0;
      const month = MONTHS_LONG[parseDate(real[s].date).getUTCMonth()];
      const left = k === 0 ? 12 : divX[k - 1] + 14;
      return {
        name: month,
        share: `${pct >= 0 ? "+" : "−"}${Math.abs(pct).toFixed(1)}%`,
        left,
      };
    });

    const out = [];
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * (m - 1);
      const j = Math.min(m - 2, Math.floor(t));
      const f = t - j;
      const v = real[j].value + (real[j + 1].value - real[j].value) * f;
      const norm = Math.max(0, Math.min(1, (v - min) / span));
      const len = (0.55 + 0.45 * norm) * BAND_H;
      const x = i * PITCH;
      const segIdx = divX.filter((d) => x >= d).length;
      out.push({ x, len, tone: tones[segIdx] ?? "default", realIdx: Math.round(t), i });
    }
    return { strokes: out, dividers: divX, labels: segLabels };
  }, [n, m, real]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const idx = Math.floor(x / PITCH);
    if (idx >= 0 && idx < n && y <= BAND_H) setHover({ idx, x, y });
    else setHover(null);
  };

  const fmtTipDate = (d: string) => {
    const date = parseDate(d);
    return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  };

  const hovered =
    hover && strokes[hover.idx] ? real[strokes[hover.idx].realIdx] : null;

  if (m < 2) return null;

  return (
    <div
      className="barcode"
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg height={SVG_H} aria-label="Published NAV per unit history">
        <defs>
          <linearGradient id={`gDefault${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(60,56,46,0.55)" />
            <stop offset="1" stopColor="rgba(60,56,46,0)" />
          </linearGradient>
          <linearGradient id={`gOlive${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(105,110,75,0.45)" />
            <stop offset="1" stopColor="rgba(105,110,75,0)" />
          </linearGradient>
          <linearGradient id={`gLight${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(60,56,46,0.30)" />
            <stop offset="1" stopColor="rgba(60,56,46,0)" />
          </linearGradient>
          <linearGradient id={`gInk${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(5,5,12,0.95)" />
            <stop offset="1" stopColor="rgba(5,5,12,0)" />
          </linearGradient>
        </defs>

        {strokes.map((s) => (
          <rect
            key={s.i}
            x={s.x}
            y="0"
            width={STROKE_W}
            height={s.len}
            className="bc-stroke"
            fill={
              s.tone === "olive"
                ? `url(#gOlive${uid})`
                : s.tone === "light"
                  ? `url(#gLight${uid})`
                  : `url(#gDefault${uid})`
            }
            style={{ "--d": `${(0.6 + s.i * 0.0012).toFixed(3)}s` } as React.CSSProperties}
          />
        ))}

        {/* hover highlight twins */}
        {strokes.map((s) => (
          <rect
            key={`h${s.i}`}
            x={s.x}
            y="0"
            width={STROKE_W}
            height={s.len}
            fill={`url(#gInk${uid})`}
            style={{
              opacity: hover && Math.abs(s.i - hover.idx) <= 3 ? 1 : 0,
              transition: "opacity 150ms ease",
              pointerEvents: "none",
            }}
          />
        ))}

        {/* month dividers: band height + 90px */}
        {dividers.map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2={SVG_H} stroke="#05050C" strokeWidth="1" />
        ))}
      </svg>

      {labels.map((l) => (
        <div className="seg-label" key={l.name + l.left} style={{ left: `${l.left}px` }}>
          <div className="nm">{l.name}</div>
          <div className="sh tnum">{l.share}</div>
        </div>
      ))}

      <div
        className={"bc-tip" + (hovered ? " show" : "")}
        style={
          hovered && hover
            ? { left: `${hover.x}px`, top: `${Math.max(34, hover.y)}px` }
            : { left: "-9999px", top: "0" }
        }
      >
        {hovered ? (
          <>
            <div className="d">{fmtTipDate(hovered.date)}</div>
            <div className="v tnum">{fmtNav(hovered.value, denomination)}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}
