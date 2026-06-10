import { requirePortalSession } from "@/lib/auth";
import {
  getPositions,
  getNavHistory,
  getCellStats,
  getActivity,
  type NavRow,
  type CellStatsRow,
  type ActivityRow,
} from "@/lib/data";
import { PendingActivation } from "@/components/PendingActivation";
import { BarcodeChart } from "@/components/BarcodeChart";
import { HeroFigure } from "@/components/HeroFigure";
import { isPreview } from "@/lib/preview";
import { RedemptionDialog } from "@/components/RedemptionDialog";
import {
  IcoBolt,
  IcoTrend,
  IcoStar4,
  IcoCalls,
  IcoStake,
  IcoFree,
} from "@/components/icons";
import { fmtNav, fmtUnits, fmtUsd, fmtNear, fmtDate } from "@/lib/format";
import type { Denomination } from "@/lib/format";

/** .denom-usd / .denom-near tags let the portal toggle foreground the
 *  active denomination; the inactive one sits at ghost opacity. Nothing
 *  is ever converted. */
const denomClass = (d: Denomination) => (d === "NEAR" ? "denom-near" : "denom-usd");

function sinceInception(hist: NavRow[]): { text: string; positive: boolean } | null {
  if (hist.length < 2) return null;
  const first = Number(hist[0].nav_per_unit);
  const last = Number(hist[hist.length - 1].nav_per_unit);
  if (!Number.isFinite(first) || !Number.isFinite(last) || first === 0) return null;
  const pct = (last / first - 1) * 100;
  const sign = pct >= 0 ? "+" : "−";
  return { text: `${sign}${Math.abs(pct).toFixed(1)}%`, positive: pct >= 0 };
}

/** "MONDAY, JUN 8 2026" ghost-ledger day header, per the handoff. */
function ledgerDay(d: string): string {
  const date = new Date(`${d.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return String(d);
  const wd = date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  const mon = date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  return `${wd.toUpperCase()}, ${mon.toUpperCase()} ${date.getUTCDate()} ${date.getUTCFullYear()}`;
}

/** Amount cell for the ghost ledger: each row in its own denomination,
 *  never merged, redemptions as a minus in muted ink (never a red fill). */
function ledgerAmount(r: ActivityRow): { text: string; cls: string } | null {
  const out = r.type === "redemption";
  const sign = out ? "−" : "";
  if (r.amount_near != null) {
    return { text: sign + fmtNear(r.amount_near), cls: `denom-near${out ? " out" : ""}` };
  }
  if (r.amount_usd != null) {
    return { text: sign + fmtUsd(r.amount_usd), cls: `denom-usd${out ? " out" : ""}` };
  }
  if (r.units != null) {
    return { text: `${sign}${fmtUnits(r.units)} units`, cls: out ? "out" : "" };
  }
  return null;
}

const SLEEVE_GLYPHS = [IcoStake, IcoCalls, IcoFree];

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
  const [cellStats, activity] = await Promise.all([
    cells.length > 0 ? getCellStats(cells) : Promise.resolve([] as CellStatsRow[]),
    getActivity(session.investorId),
    ...positions.map(async (p) => {
      const hist = await getNavHistory(p.cell, p.share_class);
      histories.set(`${p.cell}::${p.share_class}`, hist);
    }),
  ]);

  const statFor = (cell: string, cls: string) =>
    cellStats.find((s) => s.cell === cell && s.share_class === cls);

  // Ghosted activity ledger: most recent four trade dates, one column each.
  const days: { date: string; rows: ActivityRow[] }[] = [];
  for (const r of activity) {
    const last = days[days.length - 1];
    if (last && last.date === r.trade_date) last.rows.push(r);
    else days.push({ date: r.trade_date, rows: [r] });
  }
  const ledgerDays = days.slice(0, 4);

  if (positions.length === 0) {
    return (
      <section className="page-section">
        <div className="empty-state fade-2" style={{ marginTop: 44 }}>
          Nothing to report. The ledger rests. Subscriptions appear here once
          units have been issued at a published NAV.
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      {positions.map((p) => {
        const hist = histories.get(`${p.cell}::${p.share_class}`) ?? [];
        const perf = sinceInception(hist);
        return (
          <section key={`${p.cell}-${p.share_class}`}>
            <div className="eyebrow">
              <span className="ico">
                <IcoBolt size={18} />
              </span>
              <span className="t">
                Net asset value · {p.cell} · Class {p.share_class}
              </span>
            </div>

            <div className="kpi-row">
              <div className="figure-wrap">
                <HeroFigure value={p.value} denomination={p.denomination} />
                <div className="sage-pills">
                  {perf && (
                    <span className={`sage-pill tnum${perf.positive ? "" : " brick"}`}>
                      <IcoTrend size={11} /> {perf.text} since inception
                    </span>
                  )}
                  <span className={`sage-pill tnum ${denomClass(p.denomination)}`}>
                    NAV/unit {fmtNav(p.nav_per_unit, p.denomination)}
                  </span>
                </div>
              </div>

              <div className="kpi-right">
                <div className="seg tnum">
                  {["H", "D", "W", "M"].map((s) => (
                    <span key={s} className="s">
                      {s}
                    </span>
                  ))}
                  <span className="divider" />
                  <span className="s on">All</span>
                </div>
                <div className="kpi-sub tnum">
                  Class {p.share_class} is {p.denomination}-denominated · As at{" "}
                  {fmtDate(p.nav_date)}
                </div>
              </div>
            </div>

            <div className="kpi-actions">
              <RedemptionDialog
                cell={p.cell}
                shareClass={p.share_class}
                denomination={p.denomination}
                unitsAvailable={p.units}
                navPerUnit={p.nav_per_unit}
                initiallyOpen={dialogOpen && p === positions[0]}
              />
            </div>

            <div className="block-hair" />
          </section>
        );
      })}

      {/* Position strip: units held with superscript share-of-class badges,
          then class AUM, each figure in its class's own denomination. */}
      <section className="strip">
        {positions.map((p, i) => {
          const stat = statFor(p.cell, p.share_class);
          const held = Number(p.units);
          const total = stat ? Number(stat.units_outstanding) : NaN;
          const pct =
            Number.isFinite(held) && Number.isFinite(total) && total > 0
              ? (held / total) * 100
              : null;
          const Glyph = SLEEVE_GLYPHS[i % SLEEVE_GLYPHS.length];
          return (
            <div className="sleeve" key={`u-${p.share_class}`}>
              <span className="chip">
                <Glyph size={20} />
              </span>
              <span className="meta">
                <span className="val-wrap">
                  <span className="val tnum">{fmtUnits(p.units)}</span>
                  {pct !== null && (
                    <span className="sup-badge tnum">{pct.toFixed(1)}%</span>
                  )}
                </span>
                <span className="slabel">Class {p.share_class} · units held</span>
              </span>
            </div>
          );
        })}

        {cellStats.map((stat) => (
          <div className="sleeve" key={`aum-${stat.cell}-${stat.share_class}`}>
            <span className="chip">
              <IcoFree size={20} />
            </span>
            <span className="meta">
              <span className="val-wrap">
                <span className={`val tnum ${denomClass(stat.denomination)}`}>
                  {stat.denomination === "NEAR" ? (
                    <>
                      {fmtUnits(Math.round(Number(stat.aum)))}
                      <span className="suffix">NEAR</span>
                    </>
                  ) : (
                    <>$ {fmtUnits(Math.round(Number(stat.aum)))}</>
                  )}
                </span>
              </span>
              <span className="slabel">
                Cell AUM · Class {stat.share_class}
              </span>
            </span>
          </div>
        ))}

        <div className="strip-right tnum">
          {positions.map((p, i) => {
            const hist = histories.get(`${p.cell}::${p.share_class}`) ?? [];
            const perf = sinceInception(hist);
            if (!perf) return null;
            return (
              <span
                key={`d-${p.share_class}`}
                style={{ display: "inline-flex", alignItems: "baseline", gap: 16 }}
              >
                {i > 0 && <span className="srt-pipe" />}
                <span className="srt">
                  <span className="k">Class {p.share_class} inception </span>
                  <span className={`v${perf.positive ? "" : " neg"}`}>{perf.text}</span>
                </span>
              </span>
            );
          })}
        </div>
      </section>

      {/* Barcode curtains of published NAV, one per share class. */}
      {positions.map((p, i) => {
        const hist = histories.get(`${p.cell}::${p.share_class}`) ?? [];
        if (hist.length < 2) return null;
        const series = hist.map((h) => ({
          date: h.nav_date,
          value: Number(h.nav_per_unit),
        }));
        if (i === 0) {
          return (
            <BarcodeChart
              key={`chart-${p.share_class}`}
              series={series}
              denomination={p.denomination}
            />
          );
        }
        return (
          <div className="bc-block" key={`chart-${p.share_class}`}>
            <div className={`bc-cap tnum ${denomClass(p.denomination)}`}>
              NAV per unit · Class {p.share_class} ({p.denomination})
            </div>
            <BarcodeChart series={series} denomination={p.denomination} />
          </div>
        );
      })}

      {/* Ghosted activity ledger, dissolving under a gradient mask. */}
      {ledgerDays.length > 0 && (
        <div className="ledger-wrap">
          <div className="ledger">
            {ledgerDays.map((day) => (
              <div className="led-col" key={day.date}>
                <div className="led-head">{ledgerDay(day.date)}</div>
                {day.rows.map((r) => {
                  const amt = ledgerAmount(r);
                  return (
                    <div className="led-row" key={r.ref}>
                      <span className="lt">
                        <span className="tp">
                          {r.type === "subscription" ? "Subscription" : "Redemption"}
                        </span>
                        <span className="ts mono">{r.ref}</span>
                      </span>
                      {amt && <span className={`amt tnum ${amt.cls}`}>{amt.text}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="scroll-ind" aria-hidden="true">
        <span className="star">
          <IcoStar4 size={16} />
        </span>
        <span className="txt">Scroll to explore</span>
      </div>
    </section>
  );
}
