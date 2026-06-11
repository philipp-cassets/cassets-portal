/* KPI block, position strip, barcode chart, ledger, scroll indicator */

(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { FIGURES, LEDGER, NAV_POINTS, parts, full, group } = PortalData;

  /* ---------- count-up hook (expo-out, 0.9s) ---------- */
  function useCountUp(target, duration = 900, delay = 300) {
    const [v, setV] = useState(0);
    useEffect(() => {
      let raf, start, doneFlag = false;
      const tick = (t) => {
        if (start === undefined) start = t;
        const el = Math.max(0, t - start - delay);
        const k = Math.min(1, el / duration);
        const e = 1 - Math.pow(2, -10 * k); // expo-out
        setV(target * (k >= 1 ? 1 : e));
        if (k < 1) raf = requestAnimationFrame(tick);
        else doneFlag = true;
      };
      raf = requestAnimationFrame(tick);
      // fallback: if rAF is throttled (hidden tab), snap to target
      const snap = setTimeout(() => { if (!doneFlag) setV(target); }, delay + duration + 200);
      return () => { cancelAnimationFrame(raf); clearTimeout(snap); };
    }, [target]);
    return v;
  }

  /* ---------- KPI block ---------- */
  // Trend pill: real % over the selected window of the published NAV series
  // (suffix labels per §4 canon; M uses the bridge's real MTD figure).
  const TF_SUF = { H: "1h", D: "today", W: "7d", M: "MTD", All: "inception" };
  const TF_DAYS = { H: 30, D: 90, W: 180, M: 280, All: 420 };
  function tfPill(denom, timeframe) {
    if (timeframe === "M" && FIGURES.mtdPct[denom]) return FIGURES.mtdPct[denom] + " MTD";
    const pts = NAV_POINTS[denom].points;
    const w = Math.min(pts.length, TF_DAYS[timeframe] || pts.length);
    if (w < 2) return "— " + TF_SUF[timeframe];
    const pct = (pts[pts.length - 1].nav / pts[pts.length - w].nav - 1) * 100;
    return (pct >= 0 ? "+" : "−") + Math.abs(pct).toFixed(2) + "% " + TF_SUF[timeframe];
  }

  function KpiBlock({ denom, rp, timeframe, setTimeframe }) {
    const navSel = FIGURES.nav[denom];
    const counted = useCountUp(1);
    const settled = counted >= 1 - 0.000001;
    const display = settled ? navSel.v : navSel.v * counted;
    const segs = ["H", "D", "W", "M"];

    return (
      <section data-screen-label="KPI">
        <div className="eyebrow">
          <span className="ico"><IcoBolt size={18}></IcoBolt></span>
          <span className="t">Net Asset Value</span>
        </div>

        <div className="kpi-row">
          <div className="figure-wrap">
            <div className={"figure tnum" + rp}>
              <Money value={display} denom={navSel.unit}></Money>
            </div>
            <div className="sage-pills">
              <span className={"sage-pill tnum" + rp}>
                <IcoTrend size={11}></IcoTrend> {tfPill(denom, timeframe)}
              </span>
              <span className={"sage-pill tnum" + rp}>NAV/unit {FIGURES.navPerUnit[denom]}</span>
            </div>
          </div>

          <div className="kpi-right">
            <div className="seg tnum">
              {segs.map((s) => (
                <span key={s} className={"s" + (timeframe === s ? " on" : "")} onClick={() => setTimeframe(s)}>{s}</span>
              ))}
              <span className="divider"></span>
              <span className={"s" + (timeframe === "All" ? " on" : "")} onClick={() => setTimeframe("All")}>All</span>
            </div>
            <div className={"kpi-sub tnum" + rp}>
              vs previous period {full(FIGURES.prevPeriod, denom)} · {FIGURES.prevPeriodLabel} <span style={{ fontSize: "13px" }}>⌄</span>
            </div>
          </div>
        </div>

        <div className="block-hair"></div>
      </section>
    );
  }

  /* ---------- Position strip ---------- */
  const SLEEVE_GLYPHS = { calls: IcoCalls, stake: IcoStake, free: IcoFree };

  function PositionStrip({ denom, rp }) {
    return (
      <section className="strip" data-screen-label="Positions">
        {FIGURES.positions.map((pos) => {
          const G = SLEEVE_GLYPHS[pos.glyph];
          return (
            <div className="sleeve" key={pos.label}>
              <span className="chip"><G size={20}></G></span>
              <span className="meta">
                <span className="val-wrap">
                  <span className={"val tnum" + rp}>
                    <Money value={pos.value} denom={denom} ghostClass="ghost-hide"></Money>
                  </span>
                  <span className="sup-badge tnum"><IcoTrend size={8}></IcoTrend>{pos.badge.replace("+", "")}</span>
                </span>
                <span className="slabel">{pos.label}</span>
              </span>
            </div>
          );
        })}
        <div className="strip-right tnum">
          <span className="srt"><span className="k">24h delta </span><span className="v">{FIGURES.delta24h[denom]}</span></span>
          <span className="srt-pipe"></span>
          <span className="srt"><span className="k">MTD return </span><span className="v">{FIGURES.mtdReturn[denom]}</span></span>
        </div>
      </section>
    );
  }

  /* ---------- Barcode curtain chart ---------- */
  const BAND_H = 300;
  const SVG_H = 390;
  const PITCH = 6;
  const STROKE_W = 2;
  const MAX_STROKES = 420;

  // real published NAV per unit, per denomination, from the data bridge

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function BarcodeChart({ denom, timeframe }) {
    const wrapRef = useRef(null);
    const [width, setWidth] = useState(0);
    const [hover, setHover] = useState(null); // {idx, x, y}

    useEffect(() => {
      const el = wrapRef.current;
      if (!el) return;
      const ro = new ResizeObserver((es) => setWidth(es[0].contentRect.width));
      ro.observe(el);
      setWidth(el.getBoundingClientRect().width);
      return () => ro.disconnect();
    }, []);

    const SER = NAV_POINTS[denom];
    const pts = SER.points;
    const window_ = TF_DAYS[timeframe] || MAX_STROKES;
    const fit = Math.max(0, Math.floor(width / PITCH));
    // H/D windows may hold fewer real points than the window; strokes spread
    // to fill the band width (pitch = width / count), per §4 canon.
    const n = Math.max(0, Math.min(MAX_STROKES, Math.min(window_, Math.min(pts.length, fit))));
    const pitch = n > 0 ? width / n : PITCH;
    const series = pts.slice(pts.length - n);
    const min = series.length ? Math.min.apply(null, series.map((p) => p.nav)) : 0;
    const max = Math.max(min + 0.000001, series.length ? Math.max.apply(null, series.map((p) => p.nav)) : 1);

    // DELTA-LOCAL §7: curtain segments are CALENDAR MONTHS of the charted
    // window, never strategy allocations. Dividers sit on month boundaries;
    // each label shows the month and its NAV change within the window.
    const months = useMemo(() => {
      const out = [];
      series.forEach((pt, i) => {
        const key = pt.date.getFullYear() * 12 + pt.date.getMonth();
        const last = out[out.length - 1];
        if (last && last.key === key) last.end = i;
        else out.push({ key, start: i, end: i, date: pt.date });
      });
      return out;
    }, [n, width, pitch, denom]);

    const TONES = ["default", "olive", "light"];
    const strokes = useMemo(() => {
      let m = 0;
      return series.map((pt, i) => {
        while (m < months.length - 1 && i >= months[m + 1].start) m++;
        const x = i * pitch;
        const norm = Math.max(0, Math.min(1, (pt.nav - min) / (max - min)));
        const len = (0.55 + 0.45 * norm) * BAND_H;
        return { x, len, tone: TONES[m % 3], pt, i };
      });
    }, [n, width, pitch, denom]);

    const onMove = (e) => {
      const rect = wrapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const idx = Math.floor(x / pitch);
      if (idx >= 0 && idx < n && y <= BAND_H) setHover({ idx, x, y });
      else setHover(null);
    };

    const fmtDate = (d) => MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
    const fmtNav = (nav) =>
      SER.unit === "NEAR" ? nav.toFixed(4) + " NEAR" : "$ " + nav.toFixed(4);

    // Month labels: name + NAV change over the month's strokes in the
    // window. Labels on segments too narrow to carry them are skipped.
    const labels = months
      .map((m, mi) => {
        const first = series[m.start].nav;
        const last = series[m.end].nav;
        const pct = first ? (last / first - 1) * 100 : 0;
        return {
          name: MONTHS[m.date.getMonth()] + " " + m.date.getFullYear(),
          chg: (pct >= 0 ? "+" : "−") + Math.abs(pct).toFixed(2) + "%",
          left: m.start * pitch + (mi === 0 ? 12 : 14),
          w: (m.end - m.start + 1) * pitch,
        };
      })
      .filter((l) => l.w >= 90);

    return (
      <div className="barcode" ref={wrapRef} onMouseMove={onMove} onMouseLeave={() => setHover(null)} data-screen-label="Barcode chart">
        <svg height={SVG_H} aria-label="Daily NAV per unit history">
          <defs>
            <linearGradient id="gDefault" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(60,56,46,0.55)"></stop>
              <stop offset="1" stopColor="rgba(60,56,46,0)"></stop>
            </linearGradient>
            <linearGradient id="gOlive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(105,110,75,0.45)"></stop>
              <stop offset="1" stopColor="rgba(105,110,75,0)"></stop>
            </linearGradient>
            <linearGradient id="gLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(60,56,46,0.30)"></stop>
              <stop offset="1" stopColor="rgba(60,56,46,0)"></stop>
            </linearGradient>
            <linearGradient id="gInk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(5,5,12,0.95)"></stop>
              <stop offset="1" stopColor="rgba(5,5,12,0)"></stop>
            </linearGradient>
          </defs>

          {strokes.map((s) => (
            <rect
              key={s.i}
              x={s.x} y="0" width={STROKE_W} height={s.len}
              className="bc-stroke"
              fill={s.tone === "olive" ? "url(#gOlive)" : s.tone === "light" ? "url(#gLight)" : "url(#gDefault)"}
              style={{ "--d": (0.6 + s.i * 0.0012).toFixed(3) + "s" }}
            ></rect>
          ))}

          {/* hover highlight twins */}
          {strokes.map((s) => (
            <rect
              key={"h" + s.i}
              x={s.x} y="0" width={STROKE_W} height={s.len}
              fill="url(#gInk)"
              style={{
                opacity: hover && Math.abs(s.i - hover.idx) <= 3 ? 1 : 0,
                transition: "opacity 150ms ease",
                pointerEvents: "none",
              }}
            ></rect>
          ))}

          {/* month dividers: band height + 90px */}
          {months.slice(1).map((m) => (
            <line key={m.key} x1={m.start * pitch} y1="0" x2={m.start * pitch} y2={SVG_H} stroke="#05050C" strokeWidth="1"></line>
          ))}
        </svg>

        {labels.map((l) => (
          <div className="seg-label" key={l.name + l.left} style={{ left: l.left + "px" }}>
            <div className="nm">{l.name}</div>
            <div className="sh tnum">{l.chg}</div>
          </div>
        ))}

        <div
          className={"bc-tip" + (hover ? " show" : "")}
          style={hover ? { left: hover.x + "px", top: Math.max(34, hover.y) + "px" } : { left: "-9999px", top: "0" }}
        >
          {hover && series[hover.idx] ? (
            <React.Fragment>
              <div className="d">{fmtDate(series[hover.idx].date)}</div>
              <div className="v tnum">{fmtNav(series[hover.idx].nav)}</div>
            </React.Fragment>
          ) : null}
        </div>
      </div>
    );
  }

  /* ---------- Activity ledger ---------- */
  function ledgerAmt(amt, denom) {
    const sign = amt.v < 0 ? "−" : "";
    const a = Math.abs(amt.v);
    if (amt.unit === "NEAR") return sign + group(Math.round(a).toString()) + " NEAR";
    if (amt.unit === "units") return sign + group(Math.round(a).toString()) + " units";
    const fixed = a.toFixed(2);
    return sign + "$" + group(fixed.split(".")[0]) + "." + fixed.split(".")[1];
  }

  function ActivityLedger({ denom, rp }) {
    return (
      <div className="ledger-wrap" data-screen-label="Activity ledger">
        <div className="ledger">
          {LEDGER.map((col) => (
            <div className="led-col" key={col.header}>
              <div className="led-head">{col.header}</div>
              {col.rows.map((r, i) => (
                <div className="led-row" key={i}>
                  <span className="lt">
                    <span className="tp">{r.type}</span>
                    <span className="ts">{r.time}</span>
                  </span>
                  <span className={"amt tnum" + (r.amount.v < 0 ? " out" : "") + rp}>{ledgerAmt(r.amount, denom)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Scroll indicator ---------- */
  function ScrollIndicator() {
    return (
      <div className="scroll-ind">
        <span className="star"><IcoStar4 size={16}></IcoStar4></span>
        <span className="txt">Scroll to explore</span>
      </div>
    );
  }

  Object.assign(window, { KpiBlock, PositionStrip, BarcodeChart, ActivityLedger, ScrollIndicator });
})();
