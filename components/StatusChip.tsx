const OK = new Set(["settled", "completed", "confirmed", "filled", "executed", "active", "paid"]);
const BAD = new Set(["cancelled", "canceled", "rejected", "failed", "void", "voided"]);

/**
 * Status as letterspaced caps text. No badges, no pills, no color except
 * burgundy when the row is dead; in-flight states are grey, settled is ink.
 */
export function StatusChip({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls = OK.has(s) ? "" : BAD.has(s) ? " void" : " pending";
  return <span className={`status-text${cls}`}>{status}</span>;
}
