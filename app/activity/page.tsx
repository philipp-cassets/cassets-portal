import { requirePortalSession } from "@/lib/auth";
import { getActivity } from "@/lib/data";
import { PendingActivation } from "@/components/PendingActivation";
import { StatusChip } from "@/components/StatusChip";
import { fmtUsd, fmtNear, fmtUnits, fmtNav, fmtDate } from "@/lib/format";
import type { ActivityRow } from "@/lib/data";

/**
 * v_portal_activity carries no denomination column; infer it from which
 * amount field is populated. When ambiguous, render the bare number with
 * no currency marker rather than guess.
 */
function navCell(r: ActivityRow): string {
  if (r.nav_per_unit == null) return "—";
  const usd = r.amount_usd != null;
  const near = r.amount_near != null;
  if (near && !usd) return fmtNav(r.nav_per_unit, "NEAR");
  if (usd && !near) return fmtNav(r.nav_per_unit, "USD");
  return Number(r.nav_per_unit).toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

export default async function ActivityPage() {
  const session = await requirePortalSession();

  if (!session.investorId) {
    return <PendingActivation displayName={session.displayName} />;
  }

  const rows = await getActivity(session.investorId);

  return (
    <>
      <h1 className="page-title">Activity</h1>
      <p className="page-subtitle">
        Subscriptions and redemptions, most recent first. USD and NEAR amounts
        are reported separately and are never combined.
      </p>

      {rows.length === 0 ? (
        <div className="empty-state">No activity on record yet.</div>
      ) : (
        <div className="card" style={{ padding: "8px 0" }}>
          <table className="data">
            <thead>
              <tr>
                <th>Trade date</th>
                <th>Type</th>
                <th className="num">Amount (USD)</th>
                <th className="num">Amount (NEAR)</th>
                <th className="num">Units</th>
                <th className="num">NAV per unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{fmtDate(r.trade_date)}</td>
                  <td>
                    <span className={`type-label ${r.type}`}>
                      {r.type === "subscription" ? "Subscription" : "Redemption"}
                    </span>
                  </td>
                  <td className="num">
                    {r.amount_usd != null ? fmtUsd(r.amount_usd) : "—"}
                  </td>
                  <td className="num">
                    {r.amount_near != null ? fmtNear(r.amount_near) : "—"}
                  </td>
                  <td className="num">{fmtUnits(r.units)}</td>
                  <td className="num">{navCell(r)}</td>
                  <td>
                    <StatusChip status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
