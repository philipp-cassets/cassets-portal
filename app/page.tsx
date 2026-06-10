import { requirePortalSession } from "@/lib/auth";
import { getPositions, getNavHistory, type NavRow } from "@/lib/data";
import { PendingActivation } from "@/components/PendingActivation";
import { Sparkline } from "@/components/Sparkline";
import { fmtAmount, fmtNav, fmtUnits, fmtDate } from "@/lib/format";

export default async function DashboardPage() {
  const session = await requirePortalSession();

  if (!session.investorId) {
    return <PendingActivation displayName={session.displayName} />;
  }

  const positions = await getPositions(session.investorId);

  const histories = new Map<string, NavRow[]>();
  await Promise.all(
    positions.map(async (p) => {
      const hist = await getNavHistory(p.cell, p.share_class);
      histories.set(`${p.cell}::${p.share_class}`, hist);
    })
  );

  return (
    <>
      <h1 className="page-title">Position</h1>
      <p className="page-subtitle">
        Holdings as of the most recent published valuation. Each share class
        is reported in its own denomination.
      </p>

      {positions.length === 0 && (
        <div className="empty-state">
          Nothing to report. The ledger rests. Subscriptions appear here once
          units have been issued at a published NAV.
        </div>
      )}

      {positions.map((p) => {
        const hist = histories.get(`${p.cell}::${p.share_class}`) ?? [];
        const recent = hist.slice(-6).reverse();
        return (
          <section
            key={`${p.cell}-${p.share_class}`}
            className="card position-card"
          >
            <div className="card-head">
              <span className="cell-name">{p.cell}</span>
              <span className="class-name">
                {p.share_class} · {p.denomination} class
              </span>
            </div>

            <div className="headline-figure">
              <div className="label">Value</div>
              <div className="value">{fmtAmount(p.value, p.denomination)}</div>
              <div className="sub">as of {fmtDate(p.nav_date)}</div>
            </div>

            <div className="ledger">
              <div className="ledger-row">
                <span className="lbl">Units</span>
                <span className="leader" aria-hidden="true" />
                <span className="val">{fmtUnits(p.units)}</span>
              </div>
              <div className="ledger-row">
                <span className="lbl">NAV per unit</span>
                <span className="leader" aria-hidden="true" />
                <span className="val">
                  {fmtNav(p.nav_per_unit, p.denomination)}
                </span>
              </div>
            </div>

            {hist.length > 0 && (
              <div className="nav-history">
                <div className="sparkline-wrap">
                  <div className="label">Published NAV history</div>
                  <Sparkline values={hist.map((h) => h.nav_per_unit)} />
                </div>
                {recent.length > 0 && (
                  <table className="data mini" style={{ width: "auto" }}>
                    <thead>
                      <tr>
                        <th>NAV date</th>
                        <th className="num">NAV per unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((h) => (
                        <tr key={h.nav_date}>
                          <td>{fmtDate(h.nav_date)}</td>
                          <td className="num">
                            {fmtNav(h.nav_per_unit, p.denomination)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>
        );
      })}

      {positions.length > 0 && (
        <div className="fleuron" aria-hidden="true">
          ❧
        </div>
      )}
    </>
  );
}
