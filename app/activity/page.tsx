import { requirePortalSession } from "@/lib/auth";
import {
  getActivity,
  getPositions,
  getRedemptionRequests,
  type ActivityRow,
} from "@/lib/data";
import { PendingActivation } from "@/components/PendingActivation";
import { SectionHead } from "@/components/SectionHead";
import { StatusChip } from "@/components/StatusChip";
import { RedemptionDialog } from "@/components/RedemptionDialog";
import { fmtUsd, fmtNear, fmtAmount, fmtUnits, fmtNav, fmtDate } from "@/lib/format";
import type { Denomination } from "@/lib/format";

const DEAD = new Set(["cancelled", "canceled", "rejected", "failed", "void", "voided"]);
const SETTLED = new Set(["settled", "completed", "executed", "filled"]);

/** Class denomination: prefer the held position's denomination, fall back to
 *  whichever amount field is populated on the row. */
function rowDenomination(
  r: ActivityRow,
  classDenom: Map<string, Denomination>
): Denomination | null {
  const d = classDenom.get(`${r.cell}::${r.share_class}`);
  if (d) return d;
  if (r.amount_near != null && r.amount_usd == null) return "NEAR";
  if (r.amount_usd != null && r.amount_near == null) return "USD";
  return null;
}

function navCell(r: ActivityRow, denom: Denomination | null): string {
  if (r.nav_per_unit == null) return "-";
  if (denom) return fmtNav(r.nav_per_unit, denom);
  return Number(r.nav_per_unit).toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

/** Gross value in the class denomination: the instructed amount when set,
 *  otherwise units * NAV, otherwise "-". */
function grossValue(r: ActivityRow, denom: Denomination | null): string {
  const amount = denom === "NEAR" ? r.amount_near : denom === "USD" ? r.amount_usd : null;
  if (amount != null && denom) return fmtAmount(amount, denom);
  if (r.units != null && r.nav_per_unit != null) {
    const v = Number(r.units) * Number(r.nav_per_unit);
    if (Number.isFinite(v)) {
      return denom ? fmtAmount(v, denom) : v.toLocaleString("en-US", { maximumFractionDigits: 0 });
    }
  }
  return "-";
}

export default async function ActivityPage() {
  const session = await requirePortalSession();

  if (!session.investorId) {
    return <PendingActivation displayName={session.displayName} />;
  }

  const [rows, positions, requests] = await Promise.all([
    getActivity(session.investorId),
    getPositions(session.investorId),
    getRedemptionRequests(session.investorId),
  ]);

  const classDenom = new Map<string, Denomination>(
    positions.map((p) => [`${p.cell}::${p.share_class}`, p.denomination])
  );

  const openRequests = requests.filter((q) => q.status.toLowerCase() === "requested");

  // Running unit balances per class, settled rows only: amounts pending a
  // NAV strike carry no units yet, cancelled rows have no economic effect.
  const classes = [...new Set(rows.map((r) => `${r.cell}::${r.share_class}`))].sort();
  const balances = classes.map((key) => {
    const [cell, cls] = key.split("::");
    let subscribed = 0;
    let redeemed = 0;
    for (const r of rows) {
      if (`${r.cell}::${r.share_class}` !== key) continue;
      if (!SETTLED.has(r.status.toLowerCase()) || r.units == null) continue;
      const u = Number(r.units);
      if (!Number.isFinite(u)) continue;
      if (r.type === "subscription") subscribed += u;
      else redeemed += u;
    }
    return { cell, cls, subscribed, redeemed, closing: subscribed - redeemed };
  });

  return (
    <section className="page-section">
      <SectionHead num="02" title="Activity" />

      <p className="page-intro">
        Subscriptions and redemptions, most recent first. USD and NEAR amounts
        are reported separately and are never combined.
      </p>

      {rows.length === 0 ? (
        <div className="empty-state">Nothing to report. The ledger rests.</div>
      ) : (
        <>
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>Trade date</th>
                  <th>Type</th>
                  <th>Class</th>
                  <th className="r">Amount (USD)</th>
                  <th className="r">Amount (NEAR)</th>
                  <th className="r">Units</th>
                  <th className="r">NAV / unit</th>
                  <th className="r">Gross value</th>
                  <th>Settled</th>
                  <th>Ref</th>
                  <th className="r">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const denom = rowDenomination(r, classDenom);
                  const dead = DEAD.has(r.status.toLowerCase());
                  return (
                    <tr key={r.ref} className={dead ? "void" : undefined}>
                      <td>{fmtDate(r.trade_date)}</td>
                      <td>{r.type === "subscription" ? "Subscription" : "Redemption"}</td>
                      <td>{r.share_class}</td>
                      <td className="r">
                        {r.amount_usd != null ? fmtUsd(r.amount_usd) : <span className="dim">-</span>}
                      </td>
                      <td className="r">
                        {r.amount_near != null ? fmtNear(r.amount_near) : <span className="dim">-</span>}
                      </td>
                      <td className="r">
                        {r.units != null ? (
                          fmtUnits(r.units)
                        ) : r.status.toLowerCase() === "pending" ? (
                          <span className="pending-note">Awaiting NAV strike</span>
                        ) : (
                          <span className="dim">-</span>
                        )}
                      </td>
                      <td className="r">
                        {r.nav_per_unit != null ? navCell(r, denom) : <span className="dim">-</span>}
                      </td>
                      <td className="r">{grossValue(r, denom)}</td>
                      <td>
                        {r.settled_at ? fmtDate(r.settled_at) : <span className="dim">-</span>}
                      </td>
                      <td className="ref">{r.ref}</td>
                      <td className="status">
                        <StatusChip status={r.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {balances.length > 0 && (
            <div className="grid12 balances">
              {balances.map((b) => (
                <div className="bal-class" key={`${b.cell}-${b.cls}`}>
                  <div className="bc-title">
                    Class {b.cls} · Running balance, units
                  </div>
                  <div className="bal-grid">
                    <div className="bal-cell">
                      <span className="k">Opening</span>
                      <span className="v num">0</span>
                    </div>
                    <div className="bal-cell">
                      <span className="k">Subscribed</span>
                      <span className="v num">{fmtUnits(b.subscribed)}</span>
                    </div>
                    <div className="bal-cell">
                      <span className="k">Redeemed</span>
                      <span className="v num">{fmtUnits(b.redeemed)}</span>
                    </div>
                    <div className="bal-cell">
                      <span className="k">Closing</span>
                      <span className="v num closing">{fmtUnits(b.closing)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <h3 className="subhead">Redemption requests</h3>
      {openRequests.length === 0 ? (
        <div className="empty-state" style={{ borderTop: "none" }}>
          No open redemption requests.
        </div>
      ) : (
        <div className="table-scroll requests-block">
          <table className="data">
            <thead>
              <tr>
                <th>Requested</th>
                <th>Class</th>
                <th className="r">Units</th>
                <th>Note</th>
                <th>Ref</th>
                <th className="r">Status</th>
              </tr>
            </thead>
            <tbody>
              {openRequests.map((q) => (
                <tr key={q.id}>
                  <td>{fmtDate(q.requested_at)}</td>
                  <td>{q.share_class}</td>
                  <td className="r">{fmtUnits(q.units)}</td>
                  <td>{q.note ?? <span className="dim">-</span>}</td>
                  <td className="ref">{q.ref}</td>
                  <td className="status">
                    <StatusChip status="Requested" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {positions.length > 0 && (
        <div className="activity-actions">
          {positions.map((p) => (
            <span key={`${p.cell}-${p.share_class}`}>
              <span className="caps caps-grey" style={{ marginRight: 12 }}>
                Class {p.share_class}
              </span>
              <RedemptionDialog
                cell={p.cell}
                shareClass={p.share_class}
                denomination={p.denomination}
                unitsAvailable={p.units}
                navPerUnit={p.nav_per_unit}
              />
            </span>
          ))}
        </div>
      )}

      <p className="footnote">
        Subscriptions settle T+2 from the applicable NAV strike. Amounts
        pending a NAV strike are excluded from running balances until units
        are issued. Cancelled instructions are retained on the record for
        audit purposes and have no economic effect.
      </p>
    </section>
  );
}
