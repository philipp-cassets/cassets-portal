import "server-only";
import { query } from "./db";
import type { Denomination } from "./format";
import { isPreview, previewData } from "./preview";

/**
 * Typed reads against the cassets portal views.
 * EVERY investor-scoped query filters on investor_id. Do not add a query
 * here without that filter unless the underlying view has no investor data
 * (v_portal_nav, v_portal_news).
 */

export type PositionRow = {
  investor_id: string;
  cell: string;
  share_class: string;
  denomination: Denomination;
  units: string;
  nav_per_unit: string;
  value: string;
  nav_date: string;
};

export async function getPositions(investorId: string): Promise<PositionRow[]> {
  if (isPreview()) return previewData.positions;
  return query<PositionRow>(
    `SELECT investor_id, cell, share_class, denomination,
            units, nav_per_unit, value, nav_date
       FROM cassets.v_portal_position
      WHERE investor_id = $1
      ORDER BY cell, share_class`,
    [investorId]
  );
}

export type ActivityRow = {
  investor_id: string;
  type: "subscription" | "redemption";
  trade_date: string;
  amount_usd: string | null;
  amount_near: string | null;
  units: string | null;
  nav_per_unit: string | null;
  status: string;
};

export async function getActivity(investorId: string): Promise<ActivityRow[]> {
  if (isPreview()) return previewData.activity;
  return query<ActivityRow>(
    `SELECT investor_id, type, trade_date, amount_usd, amount_near,
            units, nav_per_unit, status
       FROM cassets.v_portal_activity
      WHERE investor_id = $1
      ORDER BY trade_date DESC`,
    [investorId]
  );
}

export type NavRow = {
  cell: string;
  share_class: string;
  nav_date: string;
  nav_per_unit: string;
};

/** Published NAV history for the share classes the investor holds. */
export async function getNavHistory(
  cell: string,
  shareClass: string,
  limit = 90
): Promise<NavRow[]> {
  if (isPreview()) return (previewData.nav[shareClass] ?? []).slice(-limit);
  const rows = await query<NavRow>(
    `SELECT cell, share_class, nav_date, nav_per_unit
       FROM cassets.v_portal_nav
      WHERE cell = $1 AND share_class = $2
      ORDER BY nav_date DESC
      LIMIT $3`,
    [cell, shareClass, limit]
  );
  return rows.reverse(); // ascending for charting
}

export type DocumentRow = {
  id: string;
  investor_id: string;
  doc_type: string;
  period_start: string | null;
  period_end: string | null;
  filename: string;
};

export async function getDocuments(investorId: string): Promise<DocumentRow[]> {
  if (isPreview()) return previewData.documents;
  return query<DocumentRow>(
    `SELECT id, investor_id, doc_type, period_start, period_end, filename
       FROM cassets.v_portal_documents
      WHERE investor_id = $1
      ORDER BY doc_type, period_end DESC NULLS LAST, filename`,
    [investorId]
  );
}

export type DocumentContentRow = {
  content: Buffer;
  mime_type: string;
  filename: string;
};

/**
 * Fetch a document body BY ID, with ownership enforced in the query itself:
 * the join against v_portal_documents (which carries investor_id and only
 * exposes published docs) guarantees the row belongs to this investor.
 */
export async function getDocumentForInvestor(
  documentId: string,
  investorId: string
): Promise<DocumentContentRow | null> {
  if (isPreview()) {
    return {
      content: Buffer.from("Preview document. Real statements are generated after go-live.", "utf8"),
      mime_type: "text/plain",
      filename: "preview.txt",
    };
  }
  const rows = await query<DocumentContentRow>(
    `SELECT d.content, d.mime_type, v.filename
       FROM cassets.investor_documents d
       JOIN cassets.v_portal_documents v ON v.id = d.id
      WHERE d.id = $1
        AND v.investor_id = $2
      LIMIT 1`,
    [documentId, investorId]
  );
  return rows[0] ?? null;
}

export type NewsRow = {
  id: string;
  cell: string | null;
  title: string;
  body_md: string;
  published_at: string;
};

/**
 * Published news: platform-wide posts (cell IS NULL) plus posts for cells
 * the investor actually holds.
 */
export async function getNews(cells: string[]): Promise<NewsRow[]> {
  if (isPreview()) return previewData.news;
  return query<NewsRow>(
    `SELECT id, cell, title, body_md, published_at
       FROM cassets.v_portal_news
      WHERE cell IS NULL OR cell = ANY($1::text[])
      ORDER BY published_at DESC`,
    [cells]
  );
}
