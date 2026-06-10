const OK = new Set(["settled", "completed", "confirmed", "filled", "executed", "active", "paid"]);
const BAD = new Set(["cancelled", "canceled", "rejected", "failed", "void"]);

/** Quiet status chip: green when done, amber when in flight, red when dead. */
export function StatusChip({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls = OK.has(s) ? "ok" : BAD.has(s) ? "bad" : "pending";
  return <span className={`chip ${cls}`}>{status}</span>;
}
