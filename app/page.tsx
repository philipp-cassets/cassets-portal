import { requirePortalSession } from "@/lib/auth";
import {
  getPositions,
  getNavHistory,
  getCellStats,
  type NavRow,
  type CellStatsRow,
} from "@/lib/data";
import { PendingActivation } from "@/components/PendingActivation";
import { SectionHead } from "@/components/SectionHead";
import { Sparkline } from "@/components/Sparkline";
import { RedemptionDialog } from "@/components/RedemptionDialog";
import { fmtNav, fmtUnits, fmtDate } from "@/lib/format";
import type { Denomination } from "@/lib/format";

/** Hero figure: oversized ultra-light tabular numerals, denomination-correct.
 *  NEAR amounts are "1,234,567 NEAR" (never $); USD is "$1,234,567". */
function HeroValue({ value, denomination }: { value: string; denomination: Denomination }) {
  const n = Number(value);
  const grouped = Number.isFinite(n)
    ? n.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : value;
  if (denomination === "NEAR") {
    return (
      <div className="hero-value">
        {grouped}
        <span className="unit">NEAR</span>
      </div>
    );
  }
  return (
    <div className="hero-value">
      <span className="cur">$</span>
      {grouped}
    </div>
  );
}

function sinceInception(hist: NavRow[]): { text: string; positive: boolean } | null {
  if (hist.length < 2) return null;
  const first = Number(hist[0].nav_per_unit);
  const last = Number(hist[hist.length - 1].nav_per_unit);
  if (!Number.isFinite(first) || !Number.isFinite(last) || first === 0) return null;
  const pct = (last / first - 1) * 100;
  const sign = pct >= 0 ? "+" : "";
  return { text: `${sign}${pct.toFixed(1)}%`, positive: pct >= 0 };
}

export default async function DashboardPage() {
  const session = await requirePortalSession();

  if (!session.investorId) {
    return <PendingActivation displayName={session.displayName} />;
  }

  const positions = await getPositions(session.investorId);
  const cells = [...new Set(positions.map((p) => p.cell))];

  const histories = new Map<string, NavRow[]>();
  const [cellStats] = await Promise.all([
    cells.length > 0 ? getCellStats(cells) : Promise.resolve([] as CellStatsRow[]),
    ...positions.map(async (p) => {
      const hist = await getNavHistory(p.cell, p.share_class);
      histories.set(`${p.cell}::${p.share_class}`, hist);
    }),
  ]);

  const statFor = (cell: string, cls: string) =>
    cellStats.find((s) => s.cell === cell && s.share_class === cls);

  const asAt = positions.map((p) => p.nav_date).sort().at(-1);

  return (
    <section className="page-section">
      <SectionHead num="01" title="Position" />

      {positions.length === 0 ? (
        <div className="empty-state">
          Nothing to report. The ledger rests. Subscriptions appear here once
          units have been issued at a published NAV.
        </div>
      ) : (
        <>
          <div className="investor-line">
            <div className="investor-name">{session.displayName}</div>
            <div className="investor-sub">
              {cells.map((c) => `${c} Cell`).join(" · ")} · cAssets AMC, Jersey
              {asAt ? ` · As at ${fmtDate(asAt)}` : ""}
            </div>
          </div>

          <div className="grid12 hero-figures">
            {positions.map((p) => {
              const hist = histories.get(`${p.cell}::${p.share_class}`) ?? [];
              const perf = sinceInception(hist);
              return (
                <div className="hero-fig" key={`${p.cell}-${p.share_class}`}>
                  <span className="label caps caps-grey">
                    Class {p.share_class} · {p.denomination}-denominated
                  </span>
                  <HeroValue value={p.value} denomination={p.denomination} />
                  <div className="hero-meta">
                    <div className="m">
                      <span className="k">Units held</span>
                      <span className="v num">{fmtUnits(p.units)}</span>
                    </div>
                    <div className="m">
                      <span className="k">NAV / unit</span>
                      <span className="v num">
                        {fmtNav(p.nav_per_unit, p.denomination)}
                      </span>
                    </div>
                    {perf && (
                      <div className="m">
                        <span className="k">Since inception</span>
                        <span className={`v num ${perf.positive ? "pos" : "neg"}`}>
                          {perf.text}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="hero-actions">
                    <RedemptionDialog
                      cell={p.cell}
                      shareClass={p.share_class}
                      denomination={p.denomination}
                      unitsAvailable={p.units}
                      navPerUnit={p.nav_per_unit}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {cells.map((cell) => {
            const cellPositions = positions.filter((p) => p.cell === cell);
            const withStats = cellPositions
              .map((p) => ({ p, stat: statFor(cell, p.share_class) }))
              .filter((x): x is { p: (typeof cellPositions)[number]; stat: CellStatsRow } =>
                Boolean(x.stat)
              );
            if (withStats.length === 0) return null;
            return (
              <div key={cell}>
                <h3 className="subhead">Your holding within {cell}</h3>

                <div className="grid12 holding-block">
                  {withStats.map(({ p, stat }) => {
                    const held = Number(p.units);
                    const total = Number(stat.units_outstanding);
                    const pct =
                      Number.isFinite(held) && Number.isFinite(total) && total > 0
                        ? (held / total) * 100
                        : null;
                    return (
                      <div className="holding-row" key={p.share_class}>
                        <div className="hk">
                          <span className="cls">
                            Class {p.share_class} · Units
                          </span>
                          {pct !== null && (
                            <span className="pct num">{pct.toFixed(2)}%</span>
                          )}
                        </div>
                        <div className="hv num">
                          {fmtUnits(p.units)}{" "}
                          <span className="of">
                            of {fmtUnits(stat.units_outstanding)} units in issue
                          </span>
                        </div>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{ width: `${Math.min(pct ?? 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid12 aum-row">
                  {withStats.map(({ stat }) => (
                    <div className="aum-stat" key={stat.share_class}>
                      <span className="k">
                        Cell AUM · Class {stat.share_class}
                      </span>
                      <span className="v num">
                        {stat.denomination === "NEAR" ? (
                          <>
                            {fmtUnits(stat.aum)}
                            <span className="unit">NEAR</span>
                          </>
                        ) : (
                          <>${fmtUnits(stat.aum)}</>
                        )}
                      </span>
                    </div>
                  ))}
                  <div className="aum-note">
                    Each class is valued in its own denomination; classes are
                    not aggregated.
                  </div>
                </div>
              </div>
            );
          })}

          {positions.map((p) => {
            const hist = histories.get(`${p.cell}::${p.share_class}`) ?? [];
            if (hist.length < 2) return null;
            return (
              <div className="chart-block" key={`chart-${p.cell}-${p.share_class}`}>
                <div className="chart-head">
                  <h3 className="caps">
                    Net asset value per unit · Class {p.share_class} (
                    {p.denomination})
                  </h3>
                </div>
                <Sparkline
                  values={hist.map((h) => h.nav_per_unit)}
                  startLabel={fmtDate(hist[0].nav_date)}
                  endLabel={fmtDate(hist[hist.length - 1].nav_date)}
                />
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}
