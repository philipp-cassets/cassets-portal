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
  getSubscriptionRequests,
  getDistributions,
  getNotifications,
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
 *
 * MOCK-FED INVENTORY (v3 surfaces; everything else is real):
 *  - On-chain Transparency (wallet registry, venue balances, proof of
 *    reserves): REAL data exists desk-side but venues/balances are not
 *    granted to cassets_portal; needs a DESK-SIDE migration adding a curated
 *    aggregate-safe view (v_portal_transparency) before this can be bridged.
 *    Until then prototype values stay.
 *  - Dashboard sidebar badge "2" (components.jsx NAV): decorative prototype
 *    count, no backing figure.
 *  - Statement file sizes: v_portal_documents exposes no byte size; the
 *    column shows the file kind ("PDF") instead.
 * Removed from the inventory by desk-side migration 014:
 *  - Distributions: now REAL via cassets.v_portal_distributions.
 *  - Notifications: now REAL via cassets.portal_notifications, with
 *    server-persisted per-auth-user read-state (portal_mark_notification_read
 *    / portal_mark_all_read behind /api/portal-ui/notifications/read and
 *    /read-all); the localStorage merge is gone.
 * Removed from the inventory as POLICY-EXCLUDED, not pending (DELTA-LOCAL §7,
 * strategy confidentiality: investors never see yield-strategy composition):
 *  - Dashboard barcode segment labels: the strategy-allocation segments
 *    payload is gone and will never be bridged; the curtain labels are now
 *    calendar months + month NAV change from the real published series
 *    (dashboard.jsx).
 *  - My Positions sleeve rows: replaced by REAL per-share-class rows
 *    (myPositions below, from the v_portal_position shapes). Sleeve and
 *    strategy detail (v_sleeves) is desk-only.
 *  - On-chain Transparency validator/pool tab: removed outright (screens.jsx
 *    + sidebar); pool-level detail is desk-only.
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

/** "Jun 8, 2026" short date from an ISO date or timestamp string. */
function fmtShort(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const mon = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  return `${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** "Jun 8" compact date for notification rows. */
function fmtDay(iso: string): string {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const mon = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  return `${mon} ${d.getUTCDate()}`;
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

export async function GET(request: Request) {
  // --- demo mode: public, fixture data ONLY, zero DB access, zero session ---
  // Served exclusively for /demo (fictitious "Pemberton" book). The flag runs
  // the whole handler inside demoContext so every lib/data.ts read serves
  // fixtures; the real investor payload path is untouched and session-gated.
  const isDemo = new URL(request.url).searchParams.get("demo") === "1";
  if (isDemo) {
    const { demoContext } = await import("@/lib/preview");
    return demoContext.run(true, () => handle(true));
  }
  return handle(false);
}

async function handle(demo: boolean) {
  // --- session (never the request) ---
  let authUserId: string;
  let displayName: string;
  let investorId: string | null;
  if (demo || isPreview()) {
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
  if (!demo) {
    logAccess(authUserId, investorId, "portal_page_view", "portal_ui");
  }

  const positions = await getPositions(investorId);
  const cells = [...new Set(positions.map((p) => p.cell))];

  const histories = new Map<string, NavRow[]>();
  const [cellStats, activity, documents, news, redemptionRequests, subscriptionRequests, distributionRows, notificationRows] = await Promise.all([
    cells.length > 0 ? getCellStats(cells) : Promise.resolve([]),
    getActivity(investorId),
    getDocuments(investorId),
    getNews(cells),
    getRedemptionRequests(investorId),
    getSubscriptionRequests(investorId),
    getDistributions(investorId),
    getNotifications(investorId, authUserId),
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

  // My Positions rows (REAL, DELTA-LOCAL §7): one row per HELD share class.
  // Units, NAV/unit and value all in the class's OWN denomination (never
  // converted); since-inception = last published NAV over the earliest
  // available strike of the charted series. No strategy composition is ever
  // sent to the portal.
  const myPositions = positions.map((p) => {
    const hist = histories.get(`${p.cell}::${p.share_class}`) ?? [];
    const first = hist.length ? Number(hist[0].nav_per_unit) : NaN;
    const last = Number(p.nav_per_unit);
    const since =
      Number.isFinite(first) && Number.isFinite(last) && first !== 0
        ? pctStr(last / first - 1)
        : null;
    return {
      label: `Class ${p.share_class} · ${p.denomination}`,
      units: Number(p.units),
      unitStr:
        p.denomination === "NEAR" ? `${last.toFixed(4)} NEAR` : `$ ${last.toFixed(4)}`,
      value: { v: Number(p.value), unit: p.denomination },
      since: since ?? "—",
    };
  });

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

  const histUSD = histOf(primary.USD);
  const histNEAR = histOf(primary.NEAR);

  const ts = (iso: string) =>
    new Date(iso.length <= 10 ? `${iso}T00:00:00Z` : iso).getTime();

  // --- NAV & Performance weekly table (REAL) -------------------------------
  // v_portal_nav strikes for the primary class per denomination, sampled to
  // weekly rows. Fund AUM = units in issue for the class (v_portal_cell_stats,
  // current figure) × that week's NAV/unit — expressed in the class's OWN
  // denomination, never merged or converted.
  const navTableOf = (d: Denom) => {
    const p = primary[d];
    const hist = histOf(p);
    const stat = p ? statFor(p.cell, p.share_class) : undefined;
    const units = stat ? Number(stat.units_outstanding) : NaN;
    const picked: NavRow[] = [];
    let lastT = Infinity;
    for (let i = hist.length - 1; i >= 0 && picked.length < 26; i--) {
      const t = ts(hist[i].nav_date);
      if (picked.length === 0 || lastT - t >= 7 * 86400000) {
        picked.push(hist[i]);
        lastT = t;
      }
    }
    const unit: Denom = p?.denomination ?? d;
    const rows = picked.map((r, i) => {
      const nav = Number(r.nav_per_unit);
      const older = picked[i + 1];
      const chg = older ? pctStr(nav / Number(older.nav_per_unit) - 1) : null;
      return {
        date: fmtShort(r.nav_date),
        unitStr: unit === "NEAR" ? `${nav.toFixed(4)} NEAR` : `$ ${nav.toFixed(4)}`,
        aum: { v: Number.isFinite(units) ? units * nav : 0, unit },
        chg: chg ?? "—",
      };
    });
    return { classLabel: p ? `Class ${p.share_class}` : "—", rows };
  };
  const ntUSD = navTableOf("USD");
  const ntNEAR = navTableOf("NEAR");
  // Same fallback rule as navSeries: a denomination with no real class shows
  // the other class's figures unchanged, in THEIR denomination (no conversion).
  const navTable = {
    USD: ntUSD.rows.length ? ntUSD : ntNEAR,
    NEAR: ntNEAR.rows.length ? ntNEAR : ntUSD,
  };

  // --- Pending orders (REAL) ------------------------------------------------
  // v_portal_subscription_requests + v_portal_redemption_requests (status
  // requested → UNDER REVIEW, approved → APPROVED) plus v_portal_activity
  // rows still pending the NAV strike (status pending → AWAITING NAV).
  // Amounts carry their OWN unit: class denomination for subscriptions,
  // units for redemption requests — never converted.
  const reqState = (s: string) => (s === "approved" ? "APPROVED" : "UNDER REVIEW");
  const activityAmount = (r: ActivityRow) => {
    const sign = r.type === "redemption" ? -1 : 1;
    if (r.amount_near != null) return { v: sign * Math.abs(Number(r.amount_near)), unit: "NEAR" };
    if (r.amount_usd != null) return { v: sign * Math.abs(Number(r.amount_usd)), unit: "USD" };
    return { v: sign * Math.abs(Number(r.units ?? 0)), unit: "units" };
  };
  const pendingRows = [
    ...subscriptionRequests
      .filter((r) => r.status === "requested" || r.status === "approved")
      .map((r) => ({
        ref: r.ref,
        kind: "Subscription",
        cls: r.share_class,
        amount:
          r.amount_near != null
            ? { v: Number(r.amount_near), unit: "NEAR" }
            : { v: Number(r.amount_usd ?? 0), unit: "USD" },
        placed: fmtShort(r.requested_at),
        state: reqState(r.status),
        _t: ts(r.requested_at),
      })),
    ...redemptionRequests
      .filter((r) => r.status === "requested" || r.status === "approved")
      .map((r) => ({
        ref: r.ref,
        kind: "Redemption",
        cls: r.share_class,
        amount: { v: -Math.abs(Number(r.units)), unit: "units" },
        placed: fmtShort(r.requested_at),
        state: reqState(r.status),
        _t: ts(r.requested_at),
      })),
    ...activity
      .filter((r) => r.status === "pending")
      .map((r) => ({
        ref: r.ref,
        kind: r.type === "subscription" ? "Subscription" : "Redemption",
        cls: r.share_class,
        amount: activityAmount(r),
        placed: fmtShort(r.trade_date),
        state: "AWAITING NAV",
        _t: ts(r.trade_date),
      })),
  ].sort((a, b) => b._t - a._t);
  const ordersPending = pendingRows.map(({ _t: _drop, ...o }) => o);

  // --- Settled history (REAL): v_portal_activity settled rows with strike ---
  const ordersSettled = activity
    .filter((r) => r.status === "settled" && r.nav_per_unit != null)
    .map((r) => ({
      ref: r.ref,
      kind: r.type === "subscription" ? "Subscription" : "Redemption",
      cls: r.share_class,
      amount: activityAmount(r),
      settled: fmtShort(r.settled_at ?? r.trade_date),
      unitStr: Number(r.nav_per_unit).toFixed(4),
    }));

  // New-order form: the class select fixes the denomination (house rule —
  // an order amount exists in exactly one denomination).
  const orderClasses = positions.map((p) => ({
    cell: p.cell,
    cls: p.share_class,
    denom: p.denomination,
  }));

  // --- Statements (REAL): v_portal_documents via the ownership-checked
  // download route. Confirmations / tax reports are real queries that return
  // no rows today — the screen shows the honest empty state. The view does
  // not expose a file size; the column shows the file kind instead.
  const docRow = (d: (typeof documents)[number]) => ({
    id: d.id,
    name: d.filename,
    date: fmtShort(d.period_end ?? d.period_start),
    size: "PDF",
    url: `/documents/${d.id}/download`,
  });
  const docs = {
    statements: documents.filter((d) => d.doc_type === "statement").map(docRow),
    confirmations: documents.filter((d) => d.doc_type === "confirmation").map(docRow),
    tax: documents
      .filter((d) => d.doc_type === "tax_report" || d.doc_type === "tax")
      .map(docRow),
  };

  // --- Notifications (REAL, migration 014) ---------------------------------
  // cassets.portal_notifications(investor, auth_user): event rows with
  // server-persisted per-auth-user read-state. Same {id, t, d, read} shape
  // the header dropdown consumes; mark-read goes through
  // /api/portal-ui/notifications/read + /read-all.
  const notifs = notificationRows.map((n) => ({
    id: n.id,
    kind: n.kind,
    t: n.title,
    d: fmtDay(n.created_at),
    read: n.read,
  }));

  // --- Distributions (REAL, migration 014) ---------------------------------
  // cassets.v_portal_distributions: each amount exists in exactly ONE
  // denomination (the class's own — amount_usd xor amount_near), carried as
  // {v, unit} so the screen renders it unchanged whatever the page toggle.
  const distributions = distributionRows.map((d) => ({
    ref: d.ref,
    recordDate: fmtShort(d.record_date),
    payDate: fmtShort(d.pay_date),
    desc: d.description,
    amount:
      d.amount_near != null
        ? { v: Number(d.amount_near), unit: "NEAR" }
        : { v: Number(d.amount_usd ?? 0), unit: "USD" },
    status: d.status === "paid" ? "PAID" : "DECLARED",
  }));

  // Header date-range presets (display state; each maps to a §4 timeframe so
  // selection also windows the real NAV series where cheap).
  const currentPeriod = periodLabel(now);
  const periods = [currentPeriod, `Q2 ${now.getFullYear()}`, `YTD ${now.getFullYear()}`, "Since inception"];
  const periodTf: Record<string, string> = {
    [currentPeriod]: "M",
    [`Q2 ${now.getFullYear()}`]: "D",
    [`YTD ${now.getFullYear()}`]: "W",
    "Since inception": "All",
  };

  const payload = {
    investor: {
      name: displayName,
      // No investor code exists in the portal views; derive a stable code
      // from the real investor row id (fixture code in preview).
      code: demo || isPreview() ? "@CN-0042" : `@${investorId.split("-")[0].toUpperCase()}`,
      initials: monogram(displayName),
    },
    header: {
      dateRange: currentPeriod,
      today: todayLabel(now),
    },
    periods,
    periodTf,
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
    myPositions,
    navSeries,
    navTable,
    ledger,
    ordersPending,
    ordersSettled,
    orderClasses,
    notifs,
    docs,
    distributions,
    // MOCK: on-chain transparency (wallet registry, venue balances, proof of
    // reserves). The desk DB holds the real venues/balances but the
    // cassets_portal role is not granted on them; exposing a curated,
    // aggregate-safe v_portal_transparency view needs a DESK-SIDE migration
    // (flagged in the MOCK-FED INVENTORY). Prototype values stay until then.
    // DELTA-LOCAL §7: the pool/validator tab and its payload are gone.
    wallets: [
      { label: "Custody — Sygnum", addr: "cassets-custody.near", kind: "CUSTODY" },
      { label: "On-chain treasury", addr: "cassets-treasury.near", kind: "ON-CHAIN" },
      { label: "Settlement — USDC", addr: "0x8f3C…9A41", kind: "SETTLEMENT" },
    ],
    chainVenues: [
      { name: "Sygnum Custody", near: 16300000, verified: "Jun 9, 18:00" },
      { name: "G20 OTC", near: 2000000, verified: "Jun 10, 08:00" },
      { name: "Meridian Digital", near: 1000000, verified: "Jun 9, 22:00" },
    ],
    por: [
      { date: "Jun 9, 2026", scope: "All venues + on-chain", result: "MATCHED", total: 26100000 },
      { date: "Jun 2, 2026", scope: "All venues + on-chain", result: "MATCHED", total: 25987400 },
      { date: "May 26, 2026", scope: "All venues + on-chain", result: "MATCHED", total: 25910000 },
    ],
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
