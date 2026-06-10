import "server-only";
import type { PositionRow, ActivityRow, NavRow, DocumentRow, NewsRow } from "./data";

/**
 * LOCAL DESIGN-PREVIEW MODE. Active only when PORTAL_PREVIEW=1 (never set in
 * any deployed environment). Bypasses Stack Auth and the database with
 * fixture data so the design can be reviewed before the registry schema and
 * Neon Auth are live. No fixture ever reaches production builds because the
 * env var simply is not set there; the guard lives at each call site.
 */
export const isPreview = () => process.env.PORTAL_PREVIEW === "1";

export const PREVIEW_INVESTOR_ID = "00000000-0000-0000-0000-00000000cafe";

export const previewSession = {
  authUserId: "preview-user",
  displayName: "Pemberton Family Office",
  investorId: PREVIEW_INVESTOR_ID,
};

function navSeries(start: number, drift: number, days: number): NavRow[] {
  const rows: NavRow[] = [];
  let nav = start;
  for (let i = days; i >= 0; i--) {
    const d = new Date(Date.UTC(2026, 5, 10) - i * 86400000);
    // deterministic wobble, no Math.random — preview must be stable
    nav = nav * (1 + drift + 0.004 * Math.sin(i * 1.7));
    rows.push({
      cell: "CNEAR",
      share_class: i % 1 === 0 ? "N" : "N",
      nav_date: d.toISOString().slice(0, 10),
      nav_per_unit: nav.toFixed(6),
    });
  }
  return rows;
}

const navN = navSeries(1.0, 0.0011, 60);
const navU = navSeries(1.0, 0.0008, 60).map((r) => ({ ...r, share_class: "U" }));

export const previewData = {
  positions: [
    {
      investor_id: PREVIEW_INVESTOR_ID,
      cell: "CNEAR",
      share_class: "N",
      denomination: "NEAR",
      units: "2500000",
      nav_per_unit: navN[navN.length - 1].nav_per_unit,
      value: (2500000 * Number(navN[navN.length - 1].nav_per_unit)).toFixed(0),
      nav_date: "2026-06-10",
    },
    {
      investor_id: PREVIEW_INVESTOR_ID,
      cell: "CNEAR",
      share_class: "U",
      denomination: "USD",
      units: "1000000",
      nav_per_unit: navU[navU.length - 1].nav_per_unit,
      value: (1000000 * Number(navU[navU.length - 1].nav_per_unit)).toFixed(2),
      nav_date: "2026-06-10",
    },
  ] as PositionRow[],

  activity: [
    { investor_id: PREVIEW_INVESTOR_ID, type: "subscription", trade_date: "2026-04-01", amount_near: "2500000", amount_usd: null, units: "2500000", nav_per_unit: "1.000000", status: "settled" },
    { investor_id: PREVIEW_INVESTOR_ID, type: "subscription", trade_date: "2026-04-15", amount_usd: "1000000", amount_near: null, units: "1000000", nav_per_unit: "1.000000", status: "settled" },
    { investor_id: PREVIEW_INVESTOR_ID, type: "subscription", trade_date: "2026-06-08", amount_usd: "250000", amount_near: null, units: null, nav_per_unit: null, status: "pending" },
    { investor_id: PREVIEW_INVESTOR_ID, type: "redemption", trade_date: "2026-05-20", amount_usd: null, amount_near: null, units: "100000", nav_per_unit: null, status: "cancelled" },
  ] as ActivityRow[],

  nav: { N: navN, U: navU } as Record<string, NavRow[]>,

  documents: [
    { id: "doc-1", investor_id: PREVIEW_INVESTOR_ID, doc_type: "statement", period_start: "2026-05-01", period_end: "2026-05-31", filename: "cNEAR_Statement_May_2026.pdf" },
    { id: "doc-2", investor_id: PREVIEW_INVESTOR_ID, doc_type: "statement", period_start: "2026-04-01", period_end: "2026-04-30", filename: "cNEAR_Statement_April_2026.pdf" },
    { id: "doc-3", investor_id: PREVIEW_INVESTOR_ID, doc_type: "contract", period_start: null, period_end: null, filename: "Subscription_Agreement_Class_N.pdf" },
  ] as DocumentRow[],

  news: [
    {
      id: "news-1", cell: "CNEAR", title: "cNEAR commences covered-call programme",
      body_md: "The cell has begun writing covered calls against its NEAR treasury under the investment guidelines ratified in May. Premium income will be reflected in the monthly NAV, with the first full month reported in the June statement.\n\nThe desk operates under counterparty and tenor limits reviewed quarterly.",
      published_at: "2026-06-05T09:00:00Z",
    },
    {
      id: "news-2", cell: null, title: "Welcome to the cAssets investor portal",
      body_md: "Statements, contributions, redemptions and published NAV are now available here. Documents are issued monthly; you will find them **neatly filed** under Documents.",
      published_at: "2026-06-01T09:00:00Z",
    },
  ] as NewsRow[],
};
