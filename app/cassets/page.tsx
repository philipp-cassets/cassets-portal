import type { Metadata } from "next";
import { requireDataroomViewer } from "@/lib/dataroom";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import "./onepager.css";

/**
 * cAssets firm one-pager, recreated pixel-faithfully from the design handoff
 * "cAssets One-Pager.html" (Glass Light direction). Static content only:
 * no investor data is queried or rendered here. Print-ready via the
 * stylesheet's @media print rules.
 */
const DESCRIPTION =
  "cAssets builds actively managed certificates for conviction assets: one vehicle per asset, each structured to earn while the thesis plays out.";

export const metadata: Metadata = {
  title: "cAssets · Investment Thesis",
  description: DESCRIPTION,
  openGraph: {
    title: "cAssets · Investment Thesis",
    description: DESCRIPTION,
    type: "website",
    siteName: "cAssets",
  },
};

const CREED = [
  {
    title: (
      <>
        We share your <span className="g">conviction</span> in the asset.
      </>
    ),
    sub: "We only build vehicles for assets we would hold ourselves. Our performance fees are escrowed in our own certificates: we are paid in the same exposure you hold.",
  },
  {
    title: <>Volatility is an asset, not a liability.</>,
    sub: "Early S-curve assets are volatile by nature. Volatility is what an options programme harvests: the asset's largest cost to a passive holder becomes its largest source of yield.",
  },
  {
    title: (
      <>
        We <span className="g">de-risk</span> your conviction.
      </>
    ),
    sub: "Independent custody, independent directors, first-loss escrow, monthly NAV at which you can redeem. The thesis carries the risk; the structure should never add to it.",
  },
];

const LADDER = [
  {
    n: "01",
    title: "Hold",
    sub: "Holding the asset expresses your thesis.",
    bar: "Asset",
  },
  {
    n: "02",
    title: "Stake",
    sub: "Staking avoids dilution.",
    bar: "Asset + Yield",
  },
  {
    n: "03",
    title: "Liquid stake",
    sub: "Liquid staking unlocks productivity.",
    bar: "Asset + Yield + Liquidity",
  },
  {
    n: "04",
    title: "cAssets",
    sub: "cAssets compounds your conviction.",
    bar: "Asset + Structural Yield + Liquidity + Control",
    highlight: true,
  },
];

const THEMES = [
  {
    n: "I",
    title: "Privacy",
    sub: "Institutions cannot operate on fully transparent rails. Confidential execution and confidential compute are the unlock for real size moving on-chain.",
  },
  {
    n: "II",
    title: "AI",
    sub: "Verifiable, user-owned AI infrastructure: the alternative to renting intelligence from a handful of centralised providers.",
  },
  {
    n: "III",
    title: "RWAs",
    sub: "Real-world assets are moving on-chain: treasuries, credit, collateral. The protocols that settle and service them capture the fees.",
  },
];

const SC_POINTS = [
  {
    title: (
      <>
        Early means <span className="g">mispriced</span>
      </>
    ),
    sub: "Before the steep part of the curve, fundamentals run ahead of price. That gap is the directional return.",
  },
  {
    title: (
      <>
        Early means <span className="g">volatile</span>
      </>
    ),
    sub: "Repricing does not happen in a straight line. Elevated implied volatility means options premiums are richest exactly where we operate.",
  },
  {
    title: (
      <>
        Volatility becomes <span className="g">yield</span>
      </>
    ),
    sub: "Our managed options programmes harvest that premium and compound it back into the asset. You accumulate through the noise instead of just enduring it.",
  },
];

const HOW = [
  {
    n: "01",
    title: "Hold the conviction",
    sub: "The majority of each book stays directional. When the thesis reprices, the certificate captures it.",
  },
  {
    n: "02",
    title: "Earn while you wait",
    sub: "Staking plus an active options programme target double-digit net yield, denominated in the asset, compounding your position throughout.",
  },
  {
    n: "03",
    title: "Keep control",
    sub: "Tokenised certificates: sell on secondary, redeem monthly at NAV, borrow against the position. Conviction without a lockup.",
  },
];

function SCurveChart() {
  return (
    <svg
      viewBox="0 0 440 240"
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label="An S-curve of adoption over time. A marker labelled 'we are here' sits early on the curve, just before the steep growth phase. The steep phase is shaded as the repricing zone."
    >
      <line
        x1="36"
        y1="204"
        x2="420"
        y2="204"
        stroke="rgba(0,0,0,0.14)"
        strokeWidth="1"
      />
      <line
        x1="36"
        y1="204"
        x2="36"
        y2="20"
        stroke="rgba(0,0,0,0.14)"
        strokeWidth="1"
      />
      <path
        d="M 36 200 C 140 196, 170 188, 200 160 C 240 120, 260 60, 330 38 C 370 26, 400 24, 420 23"
        fill="none"
        stroke="var(--accent-mid)"
        strokeWidth="2.5"
      />
      <rect x="200" y="20" width="130" height="184" fill="var(--accent-tint)" />
      <text
        x="265"
        y="36"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="var(--accent-deep)"
      >
        Repricing zone
      </text>
      <circle
        cx="178"
        cy="173"
        r="6"
        fill="var(--accent)"
        stroke="var(--accent-deep)"
        strokeWidth="2"
      />
      <text
        x="178"
        y="152"
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        fill="#05050C"
      >
        We are here
      </text>
      <text
        x="228"
        y="222"
        textAnchor="middle"
        fontSize="10"
        fontWeight="500"
        fill="rgba(0,0,0,0.4)"
      >
        Adoption →
      </text>
      <text
        x="26"
        y="112"
        textAnchor="middle"
        fontSize="10"
        fontWeight="500"
        fill="rgba(0,0,0,0.4)"
        transform="rotate(-90 26 112)"
      >
        Value →
      </text>
    </svg>
  );
}

export default async function CAssetsOnePager() {
  const viewer = await requireDataroomViewer("cassets");
  return (
    <div className="onepager">
      <div className="halo" />
      <div className="page">
        <header className="head">
          <div className="logo">
            <span className="c">c</span>
            <span className="rest">Assets</span>
          </div>
          <div className="head-meta">Investment Thesis · June 2026</div>
        </header>

        <section className="hero">
          <div className="eyebrow">Conviction assets, professionally managed</div>
          <h1>
            <span className="dim">When you have high conviction,</span>
            <br />
            cAssets compounds it.
          </h1>
          <p className="lead">
            cAssets builds actively managed certificates for conviction assets:
            one vehicle per asset, each structured to earn while the thesis
            plays out. We purposefully select assets aligned with the secular
            shifts we believe define the next decade, privacy, AI, and
            real-world assets, and wrap them in tokenised structures built to
            institutional scale.
          </p>

          <div className="creed">
            {CREED.map((c, i) => (
              <div className="creed-i" key={i}>
                <div className="creed-t">{c.title}</div>
                <div className="creed-s">{c.sub}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="sec">
          <h2 className="sec-h">
            Most capital stops at the first rung.{" "}
            <span className="g">We built the fourth.</span>
          </h2>
          <p className="sec-sub">
            Each step makes the same asset work harder, without giving up the
            position.
          </p>
          <div className="ladder">
            {LADDER.map((l) => (
              <div className={l.highlight ? "lad lad-hl" : "lad"} key={l.n}>
                <div className="lad-card">
                  <div className="lad-n">{l.n}</div>
                  <div className="lad-t">{l.title}</div>
                  <div className="lad-s">{l.sub}</div>
                </div>
                <div className="lad-bar">
                  <div className="lad-bar-label">{l.bar}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sec">
          <h2 className="sec-h">
            Vehicles purposefully aligned with{" "}
            <span className="g">three secular shifts.</span>
          </h2>
          <p className="sec-sub">
            We do not run a basket. Each cAsset is a deliberate, single-asset
            expression of infrastructure we believe the next decade gets built
            on, selected where the three themes converge.
          </p>
          <div className="themes">
            {THEMES.map((t) => (
              <div className="theme" key={t.n}>
                <div className="theme-n">{t.n}</div>
                <div className="theme-t">{t.title}</div>
                <div className="theme-s">{t.sub}</div>
              </div>
            ))}
            <div className="theme-base">
              <div className="theme-n">+</div>
              <div className="theme-t">Institutional scale</div>
              <div className="theme-s">
                A filter, not a theme: we only select assets capable of
                swallowing institutional-scale demand, with the liquidity,
                throughput, and real fee revenue to absorb size without
                breaking.
              </div>
            </div>
          </div>
        </section>

        <section className="sec">
          <h2 className="sec-h">
            Early on the S-curve, <span className="g">on purpose.</span>
          </h2>
          <p className="sec-sub">
            We know we are early on these assets; that is the point.
            Early-adoption assets carry volatility that scares off passive
            capital. We position where that volatility works for the holder.
          </p>
          <div className="scurve">
            <div className="sc-chart">
              <div className="sc-chart-h">Where we enter</div>
              <div className="sc-chart-s">Adoption S-curve, illustrative</div>
              <SCurveChart />
            </div>
            <div className="sc-points">
              {SC_POINTS.map((p, i) => (
                <div className="sc-point" key={i}>
                  <div className="sc-point-t">{p.title}</div>
                  <div className="sc-point-s">{p.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec">
          <h2 className="sec-h">
            One structure, <span className="g">repeated with discipline.</span>
          </h2>
          <p className="sec-sub">
            Every cAsset follows the same methodology: identify a protocol at a
            structural turning point, build the optimal certificate around it,
            deploy before the market reprices.
          </p>
          <div className="how">
            {HOW.map((h) => (
              <div className="how-i" key={h.n}>
                <div className="how-n">{h.n}</div>
                <div className="how-t">{h.title}</div>
                <div className="how-s">{h.sub}</div>
              </div>
            ))}
          </div>
          <p className="sec-sub" style={{ marginTop: 24 }}>
            <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
              cAsset Suite #001 is cNEAR
            </strong>
            : our highest-conviction expression of all three themes, live
            today. Future cAssets follow the same playbook.
          </p>
        </section>

        <footer className="foot">
          <a className="foot-mail" href="mailto:investors@cassets.xyz">
            investors@cassets.xyz
          </a>
          <div className="foot-fine">
            cAssets Management Ltd · Jersey · June 2026. Certificates issued by
            Assetize PCC, JFSC regulated. For qualified non-US institutional
            investors only. Yield figures are targets, not guarantees. Not
            financial advice; not an offer to sell.
          </div>
        </footer>
      </div>
      {viewer && (
        <FeedbackPanel doc="cassets" viewerEmail={viewer.email} />
      )}
    </div>
  );
}
