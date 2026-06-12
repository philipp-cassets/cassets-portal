"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  type ChartConfiguration,
  type ChartType,
  type Plugin,
  type TooltipItem,
} from "chart.js/auto";

/**
 * Chart.js configs ported verbatim from the design handoff's
 * thesis-charts.js (colors, data, projections, custom quadrant plugin).
 * Each component owns one canvas; charts are destroyed on unmount.
 */

const GRN = "#00A875";
const ACC = "#00C887";
const INK = "#05050C";
const MU = "rgba(0,0,0,0.40)";
const BEAR = "#B0492F";
const BASE = "#B07A29";
const GRID = "rgba(0,0,0,0.05)";
const F9 = { size: 9 };
const F10 = { size: 10 };
const F11 = { size: 11 };

function useChart(build: () => ChartConfiguration) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  // build is a stable module-level config factory per component; the chart
  // mounts once per canvas lifetime.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, build());
    return () => chart.destroy();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */
  return ref;
}

/* Confidential TVL + year-end projection */
export function ConfTvlChart() {
  const ref = useChart(() => {
    const ctLabels = ["Mar 1", "Mar 13", "Apr 1", "Apr 13", "Apr 24", "May 1", "May 15", "May 26", "Jun 5", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec 31"];
    const ctHist = [0.6, 2.5, 4.2, 5.5, 8.5, 9.5, 11.0, 17.5, 20.2, null, null, null, null, null, null];
    // ~50% MoM observed recently, decayed quarterly. Indicative, no precision implied.
    const ctProj = [null, null, null, null, null, null, null, null, 20.2, 30, 45, 64, 88, 118, 155];
    return {
      type: "bar",
      data: {
        labels: ctLabels,
        datasets: [
          { data: ctHist, backgroundColor: ACC + "88", borderColor: GRN, borderWidth: 1, borderRadius: 3 },
          { type: "line" as const, data: ctProj, borderColor: INK, borderWidth: 1.5, borderDash: [6, 4], pointRadius: 2, pointBackgroundColor: INK, tension: 0.35, spanGaps: false },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c: TooltipItem<"bar" | "line">) =>
                (c.dataset.type === "line" ? " Projected: ~$" : " $") + c.raw + "M TVL",
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: F9, color: MU } },
          y: { grid: { color: GRID }, ticks: { font: F9, color: MU, callback: (v: unknown) => "$" + v + "M" } },
        },
      },
    } as ChartConfiguration;
  });
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Bar chart of daily Confidential Intents TVL growing from near zero in February 2026 to over 20 million dollars by June 2026."
    >
      Confidential Intents TVL grew from ~0 to $20M+ between Feb and Jun 2026.
    </canvas>
  );
}

/* Intents volume + projections */
export function IntentsVolChart() {
  const ref = useChart(() => {
    const histLabels = ["Dec'24", "Feb'25", "Apr'25", "Jun'25", "Aug'25", "Oct'25", "Nov'25", "Jan'26", "Mar'26", "May'26", "Jun 1'26"];
    const histData = [0.5, 2, 5, 10, 20, 45, 120, 65, 77, 88, 130];
    const projLabels = ["Jun'26", "Jul'26", "Aug'26", "Sep'26", "Oct'26", "Nov'26", "Dec'26", "Jan'27", "Feb'27", "Mar'27", "Apr'27", "May'27", "Jun'27"];
    function proj(start: number, mom: number, decay: number) {
      const d = [start];
      let r = mom;
      for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 3 === 0) r *= decay;
        d.push(Math.round(d[d.length - 1] * (1 + r)));
      }
      return d;
    }
    const allLabels = histLabels.concat(projLabels.slice(1));
    const pad = (arr: number[]) =>
      new Array(histLabels.length - 1).fill(null).concat(arr);
    return {
      type: "line",
      data: {
        labels: allLabels,
        datasets: [
          { label: "Historical", data: histData.concat(new Array(projLabels.length - 1).fill(null)), borderColor: GRN, borderWidth: 2.5, pointRadius: 2, tension: 0.4, spanGaps: false },
          { label: "Bull", data: pad(proj(130, 0.18, 0.88)), borderColor: INK, borderWidth: 1.5, borderDash: [6, 3], pointRadius: 1, tension: 0.4, spanGaps: false },
          { label: "Base", data: pad(proj(130, 0.10, 0.86)), borderColor: BASE, borderWidth: 1.5, borderDash: [6, 3], pointRadius: 1, tension: 0.4, spanGaps: false },
          { label: "Bear", data: pad(proj(130, 0.04, 0.85)), borderColor: BEAR, borderWidth: 1.5, borderDash: [6, 3], pointRadius: 1, tension: 0.4, spanGaps: false },
          { label: "Deflationary threshold", data: new Array(allLabels.length).fill(177), borderColor: BASE, borderWidth: 1, borderDash: [3, 4], pointRadius: 0 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: (c: TooltipItem<"line">) =>
                c.raw !== null ? " " + c.dataset.label + ": $" + Math.round(c.raw as number) + "M/day" : "",
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: F9, color: MU, maxTicksLimit: 8 } },
          y: { grid: { color: GRID }, ticks: { font: F9, color: MU, callback: (v: unknown) => "$" + v + "M" }, title: { display: true, text: "Daily volume ($M)", font: F9, color: MU } },
        },
      },
    } as ChartConfiguration;
  });
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Line chart of NEAR Intents daily volume from December 2024 to June 2027 with bear, base, and bull projections and the deflationary threshold marked at 177 million dollars per day."
    >
      Historical: $0 to $130M/day. Projections to Jun 2027: bear $104M, base
      $150M, bull $220M. Threshold: $177M/day.
    </canvas>
  );
}

/* P/S comparison */
export function PsChart() {
  const ref = useChart(
    () =>
      ({
        type: "bar",
        data: {
          labels: ["Ethereum", "Solana", "Hyperliquid", "NEAR (Intents-adj.)"],
          datasets: [
            {
              data: [194, 40, 25, 45],
              backgroundColor: ["rgba(0,0,0,0.18)", "rgba(0,0,0,0.18)", "rgba(0,0,0,0.18)", ACC + "CC"],
              borderColor: ["rgba(0,0,0,0.30)", "rgba(0,0,0,0.30)", "rgba(0,0,0,0.30)", GRN],
              borderWidth: 1,
              borderRadius: 3,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c: TooltipItem<"bar">) => " " + c.raw + "x P/S" } },
          },
          scales: {
            x: { grid: { color: GRID }, ticks: { font: F10, color: MU, callback: (v: unknown) => v + "x" } },
            y: { grid: { display: false }, ticks: { font: { size: 11, weight: 500 }, color: INK } },
          },
        },
      }) as ChartConfiguration,
  );
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Horizontal bar chart comparing price-to-sales multiples: Ethereum 194x, Solana 40x, Hyperliquid 25x, NEAR Intents-adjusted 45x."
    >
      P/S: Ethereum 194x, Solana 40x, Hyperliquid 25x, NEAR 45x.
    </canvas>
  );
}

/* Price scenarios */
export function ScenChart() {
  const ref = useChart(
    () =>
      ({
        type: "bar",
        data: {
          labels: ["Year 1 (Jun 2027)", "Year 2 (Jun 2028)", "Year 3 (Jun 2029)"],
          datasets: [
            { label: "Bear", data: [2.5, 3.5, 4.8], backgroundColor: BEAR + "99", borderColor: BEAR, borderWidth: 1, borderRadius: 3 },
            { label: "Base", data: [4.7, 8.5, 15.8], backgroundColor: BASE + "99", borderColor: BASE, borderWidth: 1, borderRadius: 3 },
            { label: "Bull", data: [8.0, 18.0, 35.0], backgroundColor: ACC + "99", borderColor: GRN, borderWidth: 1, borderRadius: 3 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c: TooltipItem<"bar">) =>
                  " " + c.dataset.label + ": $" + (c.raw as number).toFixed(2),
              },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: F11, color: INK } },
            y: { grid: { color: GRID }, ticks: { font: F10, color: MU, callback: (v: unknown) => "$" + v }, title: { display: true, text: "NEAR price (USD)", font: F9, color: MU } },
          },
        },
      }) as ChartConfiguration,
  );
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Grouped bar chart of NEAR price scenarios. Bear: 2.50, 3.50, 4.80 dollars over three years. Base: 4.70, 8.50, 15.80. Bull: 8, 18, 35."
    >
      Bear: $2.50/$3.50/$4.80. Base: $4.70/$8.50/$15.80. Bull: $8/$18/$35.
      Entry $2.00.
    </canvas>
  );
}

/* Yield vs control scatter */
type YcPoint = {
  n: string;
  x: number;
  y: number;
  r: number;
  c: string;
  anchor: string;
  hl?: boolean;
};

export function YcChart() {
  const ref = useChart(() => {
    const pts: YcPoint[] = [
      { n: "Spot NEAR", x: 87, y: 0.5, r: 7, c: "#5B8A4A", anchor: "above-center" },
      { n: "ETP / 21Shares", x: 73, y: 0.0, r: 7, c: "#5B8A4A", anchor: "above-left" },
      { n: "ETF (pending)", x: 81, y: 0.0, r: 7, c: BASE, anchor: "below-right" },
      { n: "Staked ETP", x: 70, y: 3.5, r: 7, c: "#5B8A4A", anchor: "above-left" },
      { n: "SVRN (DAT)", x: 61, y: 1.4, r: 7, c: "#5B8A4A", anchor: "above-left" },
      { n: "Liq. staked NEAR", x: 50, y: 4.7, r: 7, c: "#5B8A4A", anchor: "above-left" },
      { n: "Staked NEAR", x: 20, y: 5.6, r: 7, c: "#5B8A4A", anchor: "above-right" },
      { n: "Laser Digital", x: 10, y: 3.5, r: 7, c: BEAR, anchor: "above-right" },
      { n: "Fund structures", x: 8, y: 8.5, r: 7, c: BEAR, anchor: "above-right" },
      { n: "cNEAR", x: 89, y: 12.6, r: 13, c: GRN, anchor: "below-left", hl: true },
    ];
    function lbl(anchor: string, px: number, py: number, r: number) {
      const g = r + 7;
      switch (anchor) {
        case "above-center": return { tx: px, ty: py - g, al: "center" as CanvasTextAlign };
        case "above-left": return { tx: px - g, ty: py - g, al: "right" as CanvasTextAlign };
        case "above-right": return { tx: px + g, ty: py - g, al: "left" as CanvasTextAlign };
        case "below-right": return { tx: px + g, ty: py + g + 13, al: "left" as CanvasTextAlign };
        case "below-left": return { tx: px - g, ty: py + g + 14, al: "right" as CanvasTextAlign };
        default: return { tx: px, ty: py - g, al: "center" as CanvasTextAlign };
      }
    }
    const quadrant: Plugin<ChartType> = {
      id: "quadrant",
      beforeDraw(ch) {
        const ctx = ch.ctx;
        const x = ch.scales.x;
        const y = ch.scales.y;
        const xM = x.getPixelForValue(50);
        const yM = y.getPixelForValue(6.8);
        ctx.save();
        ctx.fillStyle = "rgba(0,200,135,0.10)";
        ctx.fillRect(xM, y.top, x.right - xM, yM - y.top);
        ctx.font = "500 10px 'Inter Tight',sans-serif";
        ctx.fillStyle = GRN;
        ctx.textAlign = "right";
        ctx.fillText("White space", x.right - 6, y.top + 16);
        ctx.font = "400 9px 'Inter Tight',sans-serif";
        ctx.fillStyle = "rgba(0,168,117,0.8)";
        ctx.fillText("High yield + full control", x.right - 6, y.top + 28);
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.font = "400 9px 'Inter Tight',sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Yield, but locked", x.left + 4, y.top + 16);
        ctx.textAlign = "right";
        ctx.fillText("Liquid, low yield", x.right - 6, y.bottom - 6);
        ctx.textAlign = "left";
        ctx.fillText("Illiquid, low yield", x.left + 4, y.bottom - 6);
        ctx.restore();
      },
      afterDatasetsDraw(ch) {
        const ctx = ch.ctx;
        const x = ch.scales.x;
        const y = ch.scales.y;
        ctx.save();
        (ch.data.datasets[0].data as { x: number; y: number }[]).forEach(
          (pt, i) => {
            const v = pts[i];
            const px = x.getPixelForValue(pt.x);
            const py = y.getPixelForValue(pt.y);
            const p = lbl(v.anchor, px, py, v.r);
            if (Math.abs(p.tx - px) > 20 || Math.abs(p.ty - py) > 22) {
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(p.al === "right" ? p.tx + 2 : p.al === "left" ? p.tx - 2 : p.tx, p.ty + 3);
              ctx.strokeStyle = "rgba(0,0,0,0.1)";
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
            ctx.font = (v.hl ? "600" : "500") + " 11px 'Inter Tight',sans-serif";
            ctx.fillStyle = v.c === BEAR ? BEAR : v.c === BASE ? BASE : v.hl ? "#00744F" : "#3E6B30";
            ctx.textAlign = p.al;
            ctx.fillText(v.n, p.tx, p.ty);
          },
        );
        ctx.restore();
      },
    };
    return {
      type: "bubble",
      data: {
        datasets: [
          {
            data: pts.map((v) => ({ x: v.x, y: v.y, r: v.r })),
            backgroundColor: pts.map((v) => v.c + (v.hl ? "FF" : "CC")),
            borderColor: pts.map((v) => v.c),
            borderWidth: pts.map((v) => (v.hl ? 2.5 : 1)) as unknown as number,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 8, right: 10, bottom: 8, left: 8 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c: TooltipItem<"bubble">) =>
                " " + pts[c.dataIndex].n + ": ~" + pts[c.dataIndex].y + "% yield",
            },
          },
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            title: { display: true, text: "Control & flexibility", font: F10, color: MU },
            grid: { color: GRID },
            ticks: { font: F9, color: MU, callback: (v: unknown) => (v === 0 ? "None" : v === 50 ? "Moderate" : v === 100 ? "Full" : "") },
          },
          y: {
            min: -0.8,
            max: 14,
            title: { display: true, text: "Annual yield (%)", font: F10, color: MU },
            grid: { color: GRID },
            ticks: { font: F9, color: MU, callback: (v: unknown) => ((v as number) >= 0 ? v + "%" : "") },
          },
        },
      },
      plugins: [quadrant],
    } as ChartConfiguration;
  });
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Scatter chart: ETPs and spot NEAR cluster bottom-right with low yield and high control. Fund structures cluster top-left with yield but locked capital. cNEAR sits alone top-right with 12.6 percent yield and full control."
    >
      cNEAR: 12.6% yield with full control. Funds: yield but locked. ETPs:
      liquid but minimal yield.
    </canvas>
  );
}
