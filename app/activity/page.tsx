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

/** "MONDAY, 8 JUN 2026" day-group header (CSS sets the small caps). */
function dayHeader(d: string): string {
  const date = new Date(`${d.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return String(d);
  const wd = date.toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
  return `${wd}, ${fmtDate(d)}`;
}

const denomTag = (d: Denomination | null) =>
  d === "NEAR" ? "denom-near" : d === "USD" ? "denom-usd" : "";

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

  // Day-grouped ledger: rows arrive most recent first; group them by
  // trade date while preserving that order.
  const days: { date: string; rows: ActivityRow[] }[] = [];
  for (const r of rows) {
    const last = days[days.length - 1];
    if (last && last.date === r.trade_date) last.rows.push(r);
    else days.push({ date: r.trade_date, rows: [r] });
  }

  return (
    <section className="page-section">
      <div className="fade-1">
        <SectionHead title="Activity" />
      </div>

      <p className="page-intro fade-1">
        Subscriptions and redemptions, most recent first. USD and NEAR amounts
        are reported separately and are never combined.
      </p>

      {rows.length === 0 ? (
        <div className="empty-state fade-2">Nothing to report. The ledger rests.</div>
      ) : (
        <>
          <div className="ledger-fade fade-2">
            <div className="ledger">
              {days.map((day) => (
                <div className="led-day" key={day.date}>
                  <div className="led-day-head">{dayHeader(day.date)}</div>
                  {day.rows.map((r) => {
                    const denom = rowDenomination(r, classDenom);
                    const dead = DEAD.has(r.status.toLowerCase());
                    const outflow = r.type === "redemption";
                    const gross = grossValue(r, denom);
                    return (
                      <div className={`led-row${dead ? " void" : ""}`} key={r.ref}>
                        <div className="led-main">
                          <div>
                            <div className="led-type">
                              {r.type === "subscription" ? "Subscription" : "Redemption"}
                            </div>
                            <div className="led-ref">{r.ref}</div>
                          </div>
                          <div className="led-amounts">
                            {r.amount_usd != null && (
                              <span className={`denom-usd${outflow ? " out" : ""}`}>
                                {outflow ? "−" : ""}
                                {fmtUsd(r.amount_usd)}
                              </span>
                            )}
                            {r.amount_near != null && (
                              <span className={`denom-near${outflow ? " out" : ""}`}>
                                {outflow ? "−" : ""}
                                {fmtNear(r.amount_near)}
                              </span>
                            )}
                            {r.amount_usd == null &&
                              r.amount_near == null &&
                              r.units != null && (
                                <span className={outflow ? "out" : undefined}>
                                  {outflow ? "−" : ""}
                                  {fmtUnits(r.units)} units
                                </span>
                              )}
                          </div>
                        </div>
                        <div className="led-meta">
                          <div className="led-detail">
                            Class {r.share_class}
                            <span className="sep">·</span>
                            {r.units != null ? (
                              <>{fmtUnits(r.units)} units</>
                            ) : r.status.toLowerCase() === "pending" ? (
                              <>Awaiting NAV strike</>
                            ) : (
                              <>No units</>
                            )}
                            {r.nav_per_unit != null && (
                              <>
                                <span className="sep">·</span>
                                <span className={denomTag(denom)}>
                                  NAV/unit {navCell(r, denom)}
                                </span>
                              </>
                            )}
                            {gross !== "-" && (
                              <>
                                <span className="sep">·</span>
                                <span className={denomTag(denom)}>Gross {gross}</span>
                              </>
                            )}
                            {r.settled_at && (
                              <>
                                <span className="sep">·</span>
                                Settled {fmtDate(r.settled_at)}
                              </>
                            )}
                          </div>
                          <StatusChip status={r.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="ledger-end" aria-hidden="true">
              <span className="star">&#10022;</span> Scroll to explore
            </div>
          </div>

          {balances.length > 0 && (
            <div className="balances fade-3">
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

      <h3 className="subhead fade-4">Redemption requests</h3>
      {openRequests.length === 0 ? (
        <div className="empty-state fade-4" style={{ marginTop: 24 }}>
          No open redemption requests.
        </div>
      ) : (
        <div className="requests-block fade-4">
          {openRequests.map((q) => (
            <div className="led-row" key={q.id}>
              <div className="led-main">
                <div>
                  <div className="led-type">Redemption request</div>
                  <div className="led-ref">{q.ref}</div>
                </div>
                <div className="led-amounts">
                  <span>{fmtUnits(q.units)} units</span>
                </div>
              </div>
              <div className="led-meta">
                <div className="led-detail">
                  Class {q.share_class}
                  <span className="sep">·</span>
                  Requested {fmtDate(q.requested_at)}
                  {q.note && (
                    <>
                      <span className="sep">·</span>
                      {q.note}
                    </>
                  )}
                </div>
                <StatusChip status="Requested" />
              </div>
            </div>
          ))}
        </div>
      )}

      {positions.length > 0 && (
        <div className="activity-actions fade-4">
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

      <p className="footnote fade-4">
        Subscriptions settle T+2 from the applicable NAV strike. Amounts
        pending a NAV strike are excluded from running balances until units
        are issued. Cancelled instructions are retained on the record for
        audit purposes and have no economic effect.
      </p>
    </section>
  );
}
