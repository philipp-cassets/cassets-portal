import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { getInvestorIdForAuthUser } from "@/lib/auth";
import { isPreview, previewSession } from "@/lib/preview";
import { logAccess } from "@/lib/log";
import {
  getPositions,
  getCellStats,
  getActivity,
  getNavHistory,
  getDocuments,
  getNews,
  getRedemptionRequests,
  type NavRow,
  type PositionRow,
  type ActivityRow,
} from "@/lib/data";

/**
 * Data bridge for the vendored design prototype (public/portal-ui/*).
 * Returns the PortalData payload in the prototype's shapes, investor-scoped
 * from the real cassets.v_portal_* views.
 *
 * Session handling mirrors lib/auth.requirePortalSession: the investor id
 * comes ONLY from the Stack session -> investor_users (status='active')
 * mapping; nothing in the request can name an investor. PORTAL_PREVIEW=1
 * bypasses auth and serves the lib/preview fixtures (the lib/data getters
 * already branch on isPreview()).
 *
 * HOUSE RULE (denomination): USD and NEAR are never converted. Dual figures
 * are { USD: {v, unit}, NEAR: {v, unit} }; when a figure exists in only one
 * real denomination, that value+unit is carried under both keys so the other
 * mode renders it unchanged with its own suffix.
 */

export const dynamic = "force-dynamic";

type Denom = "USD" | "NEAR";
type Single = { v: number; unit: Denom };
type Dual = { USD: Single; NEAR: Single };

function dual(usd: number | null, near: number | null): Dual {
  const u: Single | null = usd != null && Number.isFinite(usd) ? { v: usd, unit: "USD" } : null;
  const n: Single | null = near != null && Number.isFinite(near) ? { v: near, unit: "NEAR" } : null;
  const zero: Single = { v: 0, unit: "USD" };
  return { USD: u ?? n ?? zero, NEAR: n ?? u ?? zero };
}

/** Per-denomination string with fallback to the other denomination's string. */
function dualStr(usd: string | null, near: string | null, fallback = "—"): Record<Denom, string> {
  return { USD: usd ?? near ?? fallback, NEAR: near ?? usd ?? fallback };
}

function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** "Jun 1 – Jun 10, 2026": current statement period, month-to-date. */
function periodLabel(now: Date): string {
  const mon = now.toLocaleDateString("en-US", { month: "short" });
  return `${mon} 1 – ${mon} ${now.getDate()}, ${now.getFullYear()}`;
}

/** "Wed, 10 June" for the notification pill. */
function todayLabel(now: Date): string {
  const wd = now.toLocaleDateString("en-GB", { weekday: "short" });
  const day = now.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  return `${wd}, ${day}`;
}

/** "MONDAY, JUN 8 2026" ghost-ledger day header (prototype format). */
function ledgerDay(d: string): string {
  const date = new Date(`${d.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return String(d);
  const wd = date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  const mon = date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  return `${wd.toUpperCase()}, ${mon.toUpperCase()} ${date.getUTCDate()} ${date.getUTCFullYear()}`;
}

function pctStr(ratio: number | null): string | null {
  if (ratio === null || !Number.isFinite(ratio)) return null;
  const pct = ratio * 100;
  return `${pct >= 0 ? "+" : "−"}${Math.abs(pct).toFixed(2)}%`;
}

/** Last NAV ÷ NAV at-or-before the first of the current month, minus 1. */
function mtdRatio(hist: NavRow[], now: Date): number | null {
  if (hist.length < 2) return null;
  const monthStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
  let base = hist[0];
  for (const r of hist) {
    if (r.nav_date < monthStart) base = r;
    else break;
  }
  const b = Number(base.nav_per_unit);
  const l = Number(hist[hist.length - 1].nav_per_unit);
  if (!Number.isFinite(b) || !Number.isFinite(l) || b === 0) return null;
  return l / b - 1;
}

function dayRatio(hist: NavRow[]): number | null {
  if (hist.length < 2) return null;
  const prev = Number(hist[hist.length - 2].nav_per_unit);
  const last = Number(hist[hist.length - 1].nav_per_unit);
  if (!Number.isFinite(prev) || !Number.isFinite(last) || prev === 0) return null;
  return last / prev - 1;
}

/** "apr–jun 2026" window label from the charted NAV history. */
function windowLabel(hists: NavRow[][]): string {
  const all = hists.flat();
  if (all.length === 0) return "—";
  const dates = all.map((r) => r.nav_date).sort();
  const f = new Date(`${dates[0]}T00:00:00Z`);
  const l = new Date(`${dates[dates.length - 1]}T00:00:00Z`);
  const m = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toLowerCase();
  return `${m(f)}–${m(l)} ${l.getUTCFullYear()}`;
}

export async function GET() {
  // --- session (never the request) ---
  let authUserId: string;
  let displayName: string;
  let investorId: string | null;
  if (isPreview()) {
    authUserId = previewSession.authUserId;
    displayName = previewSession.displayName;
    investorId = previewSession.investorId;
  } else {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    authUserId = user.id;
    displayName = user.displayName ?? user.primaryEmail ?? "Investor";
    investorId = await getInvestorIdForAuthUser(user.id);
  }
  if (!investorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Access log: the prototype page itself is static chrome; its single data
  // load is the page view (same lib/log.ts pattern as documents_page_view).
  logAccess(authUserId, investorId, "portal_page_view", "portal_ui");

  const positions = await getPositions(investorId);
  const cells = [...new Set(positions.map((p) => p.cell))];

  const histories = new Map<string, NavRow[]>();
  const [cellStats, activity, documents, news, redemptionRequests] = await Promise.all([
    cells.length > 0 ? getCellStats(cells) : Promise.resolve([]),
    getActivity(investorId),
    getDocuments(investorId),
    getNews(cells),
    getRedemptionRequests(investorId),
    ...positions.map(async (p) => {
      // 420 = the prototype barcode's stroke capacity (MAX_STROKES)
      histories.set(`${p.cell}::${p.share_class}`, await getNavHistory(p.cell, p.share_class, 420));
    }),
  ]);

  const now = new Date();

  // One "primary" position per denomination drives the per-denomination
  // headline strings and the barcode series (first by cell/class order).
  const primary: Partial<Record<Denom, PositionRow>> = {};
  for (const p of positions) {
    if (!primary[p.denomination]) primary[p.denomination] = p;
  }
  const histOf = (p: PositionRow | undefined) =>
    p ? histories.get(`${p.cell}::${p.share_class}`) ?? [] : [];

  // Headline NAV: sum of position values per denomination. Never converted.
  const sumBy = (d: Denom) => {
    const vals = positions.filter((p) => p.denomination === d).map((p) => Number(p.value));
    return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  };
  const nav = dual(sumBy("USD"), sumBy("NEAR"));

  // Previous period: units × NAV/unit at the start of the charted window.
  const prevOf = (d: Denom): number | null => {
    const p = primary[d];
    const hist = histOf(p);
    if (!p || hist.length === 0) return null;
    const v = Number(p.units) * Number(hist[0].nav_per_unit);
    return Number.isFinite(v) ? v : null;
  };
  const prevPeriod = dual(prevOf("USD"), prevOf("NEAR"));

  const navPerUnitStr = (d: Denom): string | null => {
    const p = primary[d];
    if (!p) return null;
    const n = Number(p.nav_per_unit);
    if (!Number.isFinite(n)) return null;
    return p.denomination === "NEAR" ? `${n.toFixed(4)} NEAR` : `$${n.toFixed(4)}`;
  };

  const statFor = (cell: string, cls: string) =>
    cellStats.find((s) => s.cell === cell && s.share_class === cls);

  // Position strip sleeves: real positions (class value, in its own
  // denomination, superscript = share of class) then class AUM sleeves.
  const sleeves = [
    ...positions.map((p) => {
      const stat = statFor(p.cell, p.share_class);
      const held = Number(p.units);
      const total = stat ? Number(stat.units_outstanding) : NaN;
      const pct =
        Number.isFinite(held) && Number.isFinite(total) && total > 0
          ? `${((held / total) * 100).toFixed(1)}%`
          : "";
      const value = Number(p.value);
      return {
        label: `Class ${p.share_class} · ${p.cell}`,
        value: dual(
          p.denomination === "USD" ? value : null,
          p.denomination === "NEAR" ? value : null
        ),
        badge: pct,
        glyph: p.denomination === "NEAR" ? "stake" : "calls",
      };
    }),
    ...cellStats.map((s) => {
      const aum = Number(s.aum);
      return {
        label: `Cell AUM · Class ${s.share_class}`,
        value: dual(
          s.denomination === "USD" ? aum : null,
          s.denomination === "NEAR" ? aum : null
        ),
        badge: "",
        glyph: "free",
      };
    }),
  ];

  // Barcode series per denomination (published NAV per unit, v_portal_nav).
  const seriesOf = (d: Denom) => {
    const p = primary[d];
    if (!p) return null;
    return {
      unit: p.denomination,
      points: histOf(p).map((r) => ({ date: r.nav_date, nav: Number(r.nav_per_unit) })),
    };
  };
  const serUSD = seriesOf("USD");
  const serNEAR = seriesOf("NEAR");
  const empty = { unit: "USD" as Denom, points: [] as { date: string; nav: number }[] };
  const navSeries = {
    USD: serUSD ?? serNEAR ?? empty,
    NEAR: serNEAR ?? serUSD ?? { ...empty, unit: "NEAR" as Denom },
  };

  // Ghost ledger: most recent four trade dates, one column each; every
  // amount in its OWN denomination (USD, NEAR or units; never converted).
  const days: { date: string; rows: ActivityRow[] }[] = [];
  for (const r of activity) {
    const last = days[days.length - 1];
    if (last && last.date === r.trade_date) last.rows.push(r);
    else days.push({ date: r.trade_date, rows: [r] });
  }
  const ledger = days.slice(0, 4).map((day) => ({
    header: ledgerDay(day.date),
    rows: day.rows.map((r) => {
      const out = r.type === "redemption";
      let v: number;
      let unit: "USD" | "NEAR" | "units";
      if (r.amount_near != null) {
        v = Number(r.amount_near);
        unit = "NEAR";
      } else if (r.amount_usd != null) {
        v = Number(r.amount_usd);
        unit = "USD";
      } else {
        v = Number(r.units ?? 0);
        unit = "units";
      }
      return {
        type: r.type === "subscription" ? "Subscription" : "Redemption",
        time: r.ref,
        amount: { v: out ? -Math.abs(v) : Math.abs(v), unit },
      };
    }),
  }));

  const notifCutoff = now.getTime() - 30 * 86400000;
  const notifCount = news.filter((p) => new Date(p.published_at).getTime() >= notifCutoff).length;

  const histUSD = histOf(primary.USD);
  const histNEAR = histOf(primary.NEAR);

  const payload = {
    investor: {
      name: displayName,
      // No investor code exists in the portal views; derive a stable code
      // from the real investor row id (fixture code in preview).
      code: isPreview() ? "@CN-0042" : `@${investorId.split("-")[0].toUpperCase()}`,
      initials: monogram(displayName),
    },
    header: {
      dateRange: periodLabel(now),
      today: todayLabel(now),
      notifCount,
    },
    figures: {
      nav,
      prevPeriod,
      prevPeriodLabel: windowLabel([histUSD, histNEAR]),
      navPerUnit: dualStr(navPerUnitStr("USD"), navPerUnitStr("NEAR")),
      mtdPct: dualStr(pctStr(mtdRatio(histUSD, now)), pctStr(mtdRatio(histNEAR, now))),
      mtdReturn: dualStr(pctStr(mtdRatio(histUSD, now)), pctStr(mtdRatio(histNEAR, now))),
      delta24h: dualStr(pctStr(dayRatio(histUSD)), pctStr(dayRatio(histNEAR))),
      positions: sleeves,
    },
    // MOCK: strategy-allocation segments (Covered Calls / Staking /
    // Unencumbered) have no portal view; prototype values stay.
    segments: [
      { name: "Covered Calls", share: 42, tone: "default" },
      { name: "Staking", share: 38, tone: "olive" },
      { name: "Unencumbered", share: 20, tone: "light" },
    ],
    navSeries,
    ledger,
    // No surfaces for these exist in the design prototype; returned so the
    // shapes are bridged and download URLs are the real ownership-checked
    // route (see MOCK-FED INVENTORY in the integration report).
    documents: documents.map((d) => ({
      id: d.id,
      doc_type: d.doc_type,
      period_start: d.period_start,
      period_end: d.period_end,
      filename: d.filename,
      url: `/documents/${d.id}/download`,
    })),
    news: news.map((n) => ({
      id: n.id,
      cell: n.cell,
      title: n.title,
      body_md: n.body_md,
      published_at: n.published_at,
    })),
    redemptionRequests: redemptionRequests.map((r) => ({
      id: r.id,
      ref: r.ref,
      cell: r.cell,
      share_class: r.share_class,
      units: r.units,
      status: r.status,
      requested_at: r.requested_at,
      note: r.note,
    })),
  };

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
