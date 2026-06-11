import "server-only";
import type {
  PositionRow,
  ActivityRow,
  NavRow,
  DocumentRow,
  NewsRow,
  CellStatsRow,
  RedemptionRequestRow,
  SubscriptionRequestRow,
  DistributionRow,
  NotificationRow,
} from "./data";

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
    // deterministic wobble, no Math.random - preview must be stable
    nav = nav * (1 + drift + 0.004 * Math.sin(i * 1.7));
    rows.push({
      cell: "CNEAR",
      share_class: "N",
      nav_date: d.toISOString().slice(0, 10),
      nav_per_unit: nav.toFixed(6),
    });
  }
  return rows;
}

/* Notification fixtures (migration 014 shape). Read-state is mutable
   module-level state so the preview read routes behave like the real
   server-persisted store within a dev-server process: a mark-read POST
   survives the next page load. Notification 1 starts read (4 rows, 1 read). */
const PREVIEW_NOTIFICATIONS: Omit<NotificationRow, "read">[] = [
  {
    id: "4",
    kind: "nav_published",
    title: "Weekly NAV published — Class N",
    body: null,
    ref: null,
    created_at: "2026-06-10T07:00:00Z",
  },
  {
    id: "3",
    kind: "order_decided",
    title: "Subscription SUBR-2026-0004 approved",
    body: null,
    ref: "SUBR-2026-0004",
    created_at: "2026-06-06T10:05:00Z",
  },
  {
    id: "2",
    kind: "distribution",
    title: "Distribution DIST-2026-0005 paid",
    body: null,
    ref: "DIST-2026-0005",
    created_at: "2026-06-02T12:00:00Z",
  },
  {
    id: "1",
    kind: "statement_issued",
    title: "May 2026 statement available",
    body: null,
    ref: "doc-1",
    created_at: "2026-06-01T09:00:00Z",
  },
];
const previewReadIds = new Set<string>(["1"]);

const navN = navSeries(1.0, 0.0011, 60);
const navU = navSeries(1.0, 0.0008, 60).map((r) => ({ ...r, share_class: "U" }));

const lastNavN = navN[navN.length - 1].nav_per_unit;
const lastNavU = navU[navU.length - 1].nav_per_unit;

// Class totals for the whole cell. Held units (2,500,000 N / 1,000,000 U)
// against these produce ~13.59% / ~13.07% proportion bars.
const UNITS_OUTSTANDING_N = 18_400_000;
const UNITS_OUTSTANDING_U = 7_650_000;

export const previewData = {
  positions: [
    {
      investor_id: PREVIEW_INVESTOR_ID,
      cell: "CNEAR",
      share_class: "N",
      denomination: "NEAR",
      units: "2500000",
      nav_per_unit: lastNavN,
      value: (2500000 * Number(lastNavN)).toFixed(0),
      nav_date: "2026-06-10",
    },
    {
      investor_id: PREVIEW_INVESTOR_ID,
      cell: "CNEAR",
      share_class: "U",
      denomination: "USD",
      units: "1000000",
      nav_per_unit: lastNavU,
      value: (1000000 * Number(lastNavU)).toFixed(2),
      nav_date: "2026-06-10",
    },
  ] as PositionRow[],

  cellStats: [
    {
      cell: "CNEAR",
      share_class: "N",
      denomination: "NEAR",
      units_outstanding: String(UNITS_OUTSTANDING_N),
      nav_per_unit: lastNavN,
      nav_date: "2026-06-10",
      aum: (UNITS_OUTSTANDING_N * Number(lastNavN)).toFixed(0),
    },
    {
      cell: "CNEAR",
      share_class: "U",
      denomination: "USD",
      units_outstanding: String(UNITS_OUTSTANDING_U),
      nav_per_unit: lastNavU,
      nav_date: "2026-06-10",
      aum: (UNITS_OUTSTANDING_U * Number(lastNavU)).toFixed(2),
    },
  ] as CellStatsRow[],

  activity: [
    {
      investor_id: PREVIEW_INVESTOR_ID,
      type: "subscription",
      trade_date: "2026-06-08",
      amount_usd: "250000",
      amount_near: null,
      units: null,
      nav_per_unit: null,
      status: "pending",
      cell: "CNEAR",
      share_class: "U",
      settled_at: null,
      ref: "SUB-2026-0019",
    },
    {
      investor_id: PREVIEW_INVESTOR_ID,
      type: "redemption",
      trade_date: "2026-05-20",
      amount_usd: null,
      amount_near: null,
      units: "100000",
      nav_per_unit: null,
      status: "cancelled",
      cell: "CNEAR",
      share_class: "N",
      settled_at: null,
      ref: "RED-2026-0002",
    },
    {
      investor_id: PREVIEW_INVESTOR_ID,
      type: "redemption",
      trade_date: "2026-05-18",
      amount_usd: null,
      amount_near: "200000",
      units: "195312",
      nav_per_unit: "1.024000",
      status: "settled",
      cell: "CNEAR",
      share_class: "N",
      settled_at: "2026-05-20T12:00:00Z",
      ref: "RED-2026-0003",
    },
    {
      investor_id: PREVIEW_INVESTOR_ID,
      type: "subscription",
      trade_date: "2026-04-15",
      amount_usd: "1000000",
      amount_near: null,
      units: "1000000",
      nav_per_unit: "1.000000",
      status: "settled",
      cell: "CNEAR",
      share_class: "U",
      settled_at: "2026-04-17T12:00:00Z",
      ref: "SUB-2026-0011",
    },
    {
      investor_id: PREVIEW_INVESTOR_ID,
      type: "subscription",
      trade_date: "2026-04-01",
      amount_near: "2500000",
      amount_usd: null,
      units: "2500000",
      nav_per_unit: "1.000000",
      status: "settled",
      cell: "CNEAR",
      share_class: "N",
      settled_at: "2026-04-03T12:00:00Z",
      ref: "SUB-2026-0007",
    },
  ] as ActivityRow[],

  redemptionRequests: [
    {
      investor_id: PREVIEW_INVESTOR_ID,
      id: "req-0003",
      ref: "REQ-2026-0003",
      cell: "CNEAR",
      share_class: "N",
      units: "50000",
      status: "requested",
      requested_at: "2026-06-09T09:30:00Z",
      note: null,
    },
  ] as RedemptionRequestRow[],

  /** Readback returned by the redemption-request route in preview mode. */
  redemptionReadback: (units: number, shareClass: string) => ({
    id: "req-preview-new",
    ref: "REQ-2026-0042",
    units: String(units),
    share_class: shareClass,
    status: "requested" as const,
  }),

  subscriptionRequests: [
    {
      investor_id: PREVIEW_INVESTOR_ID,
      id: "subr-0005",
      ref: "SUBR-2026-0005",
      cell: "CNEAR",
      share_class: "N",
      amount_usd: null,
      amount_near: "500000",
      status: "requested",
      requested_at: "2026-06-09T14:00:00Z",
      note: null,
    },
    {
      investor_id: PREVIEW_INVESTOR_ID,
      id: "subr-0004",
      ref: "SUBR-2026-0004",
      cell: "CNEAR",
      share_class: "U",
      amount_usd: "150000",
      amount_near: null,
      status: "approved",
      requested_at: "2026-06-06T10:00:00Z",
      note: null,
    },
  ] as SubscriptionRequestRow[],

  /** Readback returned by the order route (subscribe) in preview mode. */
  subscriptionReadback: (
    cell: string,
    shareClass: string,
    amountUsd: number | null,
    amountNear: number | null
  ) => ({
    id: "subr-preview-new",
    ref: "SUBR-2026-0042",
    cell,
    share_class: shareClass,
    amount_usd: amountUsd != null ? String(amountUsd) : null,
    amount_near: amountNear != null ? String(amountNear) : null,
    status: "requested" as const,
  }),

  /* v_portal_distributions fixtures (migration 014). Amounts carry the class
     denomination — exactly one of amount_usd / amount_near, never converted.
     Paid Class N row: 0.0120 NEAR/unit × 2,500,000 held units = 30,000 NEAR. */
  distributions: [
    {
      investor_id: PREVIEW_INVESTOR_ID,
      ref: "DIST-2026-0006",
      record_date: "2026-06-26",
      pay_date: "2026-07-02",
      description: "June distribution — Class U",
      amount_usd: "9800.00",
      amount_near: null,
      status: "declared",
    },
    {
      investor_id: PREVIEW_INVESTOR_ID,
      ref: "DIST-2026-0005",
      record_date: "2026-05-29",
      pay_date: "2026-06-02",
      description: "May distribution — Class N · 0.0120 NEAR/unit",
      amount_usd: null,
      amount_near: "30000",
      status: "paid",
    },
  ] as DistributionRow[],

  /** cassets.portal_notifications fixture rows with the mutable read-state applied. */
  notifications: (): NotificationRow[] =>
    PREVIEW_NOTIFICATIONS.map((n) => ({ ...n, read: previewReadIds.has(n.id) })),

  /** Readback stub for POST /api/portal-ui/notifications/read in preview. */
  markNotificationRead: (id: string): void => {
    if (PREVIEW_NOTIFICATIONS.some((n) => n.id === id)) previewReadIds.add(id);
  },

  /** Readback stub for POST /api/portal-ui/notifications/read-all in preview. */
  markAllNotificationsRead: (): void => {
    for (const n of PREVIEW_NOTIFICATIONS) previewReadIds.add(n.id);
  },

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
