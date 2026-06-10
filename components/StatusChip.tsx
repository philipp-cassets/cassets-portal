const OK = new Set(["settled", "completed", "confirmed", "filled", "executed", "active", "paid"]);
const BAD = new Set(["cancelled", "canceled", "rejected", "failed", "void"]);

/**
 * Status as a rubber ink stamp on paper: sage when settled, ochre when in
 * flight, struck through in muted ink when dead. Slightly rotated, as a
 * stamp would land.
 */
export function StatusChip({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls = OK.has(s) ? "ok" : BAD.has(s) ? "bad" : "pending";
  return <span className={`chip ${cls}`}>{status}</span>;
}
