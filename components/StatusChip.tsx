const OK = new Set(["settled", "completed", "confirmed", "filled", "executed", "active", "paid"]);
const BAD = new Set(["cancelled", "canceled", "rejected", "failed", "void", "voided"]);

/**
 * Status as a pill badge: sage-olive when settled (the portal's only
 * accent), a quiet hairline pill while in flight, dry brick when the row
 * is dead. Never bright red.
 */
export function StatusChip({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls = OK.has(s) ? "ok" : BAD.has(s) ? "void" : "pending";
  return <span className={`status-pill ${cls}`}>{status}</span>;
}
