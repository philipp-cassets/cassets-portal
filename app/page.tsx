import { requirePortalSession } from "@/lib/auth";
import {
  getPositions,
  getNavHistory,
  getCellStats,
  type NavRow,
  type CellStatsRow,
} from "@/lib/data";
import { PendingActivation } from "@/components/PendingActivation";
import { BarcodeChart } from "@/components/BarcodeChart";
import { isPreview } from "@/lib/preview";
import { RedemptionDialog } from "@/components/RedemptionDialog";
import { fmtNav, fmtUnits, fmtDate } from "@/lib/format";
import type { Denomination } from "@/lib/format";

/** .denom-usd / .denom-near tags let the portal toggle foreground the
 *  active denomination; the inactive one sits at ghost opacity. Nothing
 *  is ever converted. */
const denomClass = (d: Denomination) => (d === "NEAR" ? "denom-near" : "denom-usd");

/** Hero figure: oversized tabular numerals with ghosted decimals,
 *  denomination-correct. NEAR amounts are "1,234,567 NEAR" (never $);
 *  USD is "$1,234,567" with the decimals as a ghost span. */
function HeroValue({ value, denomination }: { value: string; denomination: Denomination }) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return <div className={`kpi-value ${denomClass(denomination)}`}>{value}</div>;
  }
  const s = n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [int, dec] = s.split(".");
  if (denomination === "NEAR") {
    return (
      <div className={`kpi-value ${denomClass(denomination)}`}>
        {int}
        <span className="dec">.{dec}</span>
        <span className="unit">NEAR</span>
      </div>
    );
  }
  return (
    <div className={`kpi-value ${denomClass(denomination)}`}>
      <span className="cur">$</span>
      {int}
      <span className="dec">.{dec}</span>
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePortalSession();

  if (!session.investorId) {
    return <PendingActivation displayName={session.displayName} />;
  }

  // PREVIEW-ONLY: ?dialog=1 renders the first redemption dialog open so the
  // screenshot loop can verify it. Gated on PORTAL_PREVIEW; a no-op in any
  // deployed environment.
  const sp = searchParams ? await searchParams : undefined;
  const dialogOpen = isPreview() && sp?.dialog === "1";

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
      {positions.length === 0 ? (
        <div className="empty-state fade-2">
          Nothing to report. The ledger rests. Subscriptions appear here once
          units have been issued at a published NAV.
        </div>
      ) : (
        <>
          <div className="investor-line fade-1">
            {cells.map((c) => `${c} Cell`).join(" · ")} · cAssets AMC, Jersey
            {asAt ? ` · As at ${fmtDate(asAt)}` : ""}
          </div>

          {positions.map((p, i) => {
            const hist = histories.get(`${p.cell}::${p.share_class}`) ?? [];
            const perf = sinceInception(hist);
            return (
              <div
                className={`kpi ${i === 0 ? "fade-2" : "fade-3"}`}
                key={`${p.cell}-${p.share_class}`}
              >
                <div className="kpi-eyebrow">
                  <span className="glyph" aria-hidden="true">
                    &#10033;
                  </span>
                  Net asset value · {p.cell} · Class {p.share_class}
                </div>
                <div className="kpi-row">
                  <HeroValue value={p.value} denomination={p.denomination} />
                  <div className="kpi-pills">
                    {perf && (
                      <span
                        className={`pill num${perf.positive ? "" : " pill-negative"}`}
                      >
                        {perf.positive ? "↗" : "↘"} {perf.text} since
                        inception
                      </span>
                    )}
                    <span
                      className={`pill pill-neutral num ${denomClass(p.denomination)}`}
                    >
                      NAV/unit {fmtNav(p.nav_per_unit, p.denomination)}
                    </span>
                    <span className="pill pill-muted num">
                      {fmtUnits(p.units)} units held
                    </span>
                  </div>
                </div>
                <div className="kpi-sub">
                  Class {p.share_class} is {p.denomination}-denominated · As at{" "}
                  {fmtDate(p.nav_date)}
                </div>
                <div className="kpi-actions">
                  <RedemptionDialog
                    cell={p.cell}
                    shareClass={p.share_class}
                    denomination={p.denomination}
                    unitsAvailable={p.units}
                    navPerUnit={p.nav_per_unit}
                    initiallyOpen={dialogOpen && i === 0}
                  />
                </div>
              </div>
            );
          })}

          {cells.map((cell) => {
            const cellPositions = positions.filter((p) => p.cell === cell);
            const withStats = cellPositions
              .map((p) => ({ p, stat: statFor(cell, p.share_class) }))
              .filter((x): x is { p: (typeof cellPositions)[number]; stat: CellStatsRow } =>
                Boolean(x.stat)
              );
            if (withStats.length === 0) return null;
            return (
              <div key={cell} className="fade-4">
                <h3 className="subhead">Your holding within {cell}</h3>

                <div className="strip" style={{ borderTop: "none" }}>
                  {withStats.map(({ p, stat }) => {
                    const held = Number(p.units);
                    const total = Number(stat.units_outstanding);
                    const pct =
                      Number.isFinite(held) && Number.isFinite(total) && total > 0
                        ? (held / total) * 100
                        : null;
                    return (
                      <div className="strip-item" key={p.share_class}>
                        <span className="strip-chip" aria-hidden="true">
                          {p.share_class}
                        </span>
                        <div>
                          <div className="strip-value num">
                            {fmtUnits(p.units)}
                            <span className="unit">units</span>
                            {pct !== null && <sup>{pct.toFixed(2)}%</sup>}
                          </div>
                          <div className="strip-label">
                            of {fmtUnits(stat.units_outstanding)} in issue ·
                            Class {p.share_class}
                          </div>
                          <div className="strip-bar">
                            <div
                              className="fill"
                              style={{ width: `${Math.min(pct ?? 0, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {withStats.map(({ stat }) => (
                    <div className="strip-item" key={`aum-${stat.share_class}`}>
                      <span className="strip-chip" aria-hidden="true">
                        {stat.denomination === "NEAR" ? "N" : "$"}
                      </span>
                      <div>
                        <div
                          className={`strip-value num ${denomClass(stat.denomination)}`}
                        >
                          {stat.denomination === "NEAR" ? (
                            <>
                              {fmtUnits(stat.aum)}
                              <span className="unit">NEAR</span>
                            </>
                          ) : (
                            <>${fmtUnits(stat.aum)}</>
                          )}
                        </div>
                        <div className="strip-label">
                          Cell AUM · Class {stat.share_class}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="strip-deltas">
                    {withStats.map(({ p }) => {
                      const hist = histories.get(`${cell}::${p.share_class}`) ?? [];
                      const perf = sinceInception(hist);
                      if (!perf) return null;
                      return (
                        <div key={`d-${p.share_class}`}>
                          Class {p.share_class} since inception{" "}
                          <b className={`num${perf.positive ? "" : " neg"}`}>
                            {perf.text}
                          </b>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="strip-note">
                  Each class is valued in its own denomination; classes are
                  not aggregated.
                </p>
              </div>
            );
          })}

          {positions.map((p) => {
            const hist = histories.get(`${p.cell}::${p.share_class}`) ?? [];
            if (hist.length < 2) return null;
            const perf = sinceInception(hist);
            return (
              <div
                className="chart-block fade-5"
                key={`chart-${p.cell}-${p.share_class}`}
              >
                <div className="chart-head">
                  <h3 className="caps">
                    Net asset value per unit · Class {p.share_class} (
                    {p.denomination})
                  </h3>
                  <span className="pill pill-muted num">
                    {hist.length} published NAVs
                  </span>
                </div>
                <div className={denomClass(p.denomination)}>
                  <BarcodeChart
                    series={hist.map((h) => ({
                      date: h.nav_date,
                      value: Number(h.nav_per_unit),
                    }))}
                    denomination={p.denomination}
                    startLabel={fmtDate(hist[0].nav_date)}
                    endLabel={fmtDate(hist[hist.length - 1].nav_date)}
                    segmentLabel={`${p.cell} · Class ${p.share_class}`}
                    segmentSub={perf ? `${perf.text} since inception` : undefined}
                  />
                </div>
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}
