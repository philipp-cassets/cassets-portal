/**
 * Formatting helpers.
 *
 * HARD RULE: NEAR-denominated amounts are rendered as "1,234,567 NEAR",
 * never with a "$". USD amounts use "$1,234,567". Amounts in different
 * denominations are never summed or converted.
 */

export type Denomination = "USD" | "NEAR";

function toNumber(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function group(n: number, minFrac: number, maxFrac: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
  });
}

/** "$1,234,567.89" */
export function fmtUsd(v: string | number | null | undefined): string {
  const n = toNumber(v);
  if (n === null) return "-";
  return `$${group(n, 2, 2)}`;
}

/** "1,234,567 NEAR" (no $ ever) */
export function fmtNear(v: string | number | null | undefined): string {
  const n = toNumber(v);
  if (n === null) return "-";
  // Show decimals only when present, max 4.
  const hasFrac = Math.abs(n - Math.trunc(n)) > 1e-9;
  return `${group(n, 0, hasFrac ? 4 : 0)} NEAR`;
}

/** Denomination-aware amount formatting. */
export function fmtAmount(
  v: string | number | null | undefined,
  denomination: Denomination
): string {
  return denomination === "NEAR" ? fmtNear(v) : fmtUsd(v);
}

/** NAV per unit: more precision, still denomination-correct. */
export function fmtNav(
  v: string | number | null | undefined,
  denomination: Denomination
): string {
  const n = toNumber(v);
  if (n === null) return "-";
  const s = group(n, 4, 4);
  return denomination === "NEAR" ? `${s} NEAR` : `$${s}`;
}

/** Units (share count), up to 4 decimals. */
export function fmtUnits(v: string | number | null | undefined): string {
  const n = toNumber(v);
  if (n === null) return "-";
  const hasFrac = Math.abs(n - Math.trunc(n)) > 1e-9;
  return group(n, 0, hasFrac ? 4 : 0);
}

/** "12 May 2026" from a YYYY-MM-DD date string. */
export function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(`${d.slice(0, 10)}T00:00:00Z`) : d;
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function fmtDateTime(d: string | Date | null | undefined): string {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
