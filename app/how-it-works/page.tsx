import type { Metadata } from "next";
import { requireDataroomViewer } from "@/lib/dataroom";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import "./howitworks.css";

/**
 * cNEAR mechanics one-pager, recreated pixel-faithfully from the design
 * handoff "cNEAR How It Works.html" (Glass Light direction). Static content
 * only: no investor data is queried or rendered here. Print-ready via the
 * stylesheet's @media print rules.
 */
const DESCRIPTION =
  "cNEAR is a tokenised, actively managed certificate: a debt instrument issued by a protected cell of Assetize PCC in Jersey, managed by cAssets under a defined mandate.";

export const metadata: Metadata = {
  title: "cNEAR · How It Works",
  description: DESCRIPTION,
  openGraph: {
    title: "cNEAR · How It Works",
    description: DESCRIPTION,
    type: "website",
    siteName: "cNEAR",
  },
};

const STEPS = [
  {
    title: "Subscribe at NAV",
    sub: "Capital enters the cell at the prevailing NAV. No dilution of existing holders; the hard cap is hard.",
  },
  {
    title: "The cell buys NEAR",
    sub: "Subscriptions convert to NEAR held with the independent custodian. The book stays predominantly directional.",
  },
  {
    title: "The strategy runs",
    sub: "cAssets deploys the yield programme across four sleeves, delta-managed to retain upside.",
  },
  {
    title: "Yield compounds in NEAR",
    sub: "Premiums and staking rewards are harvested and compounded back into the asset, growing NAV per certificate.",
  },
  {
    title: "NAV published monthly",
    sub: "On-chain NAV, risk reports, and trading records go to all holders every month. Nothing on faith.",
  },
  {
    title: "Exit on your terms",
    sub: "Redeem monthly at NAV, sell on the secondary market, or borrow against the certificate. Conviction without a lockup.",
  },
];

const ALLOC = [
  { pct: "20%", name: "Staking", flex: 20, dark: false },
  { pct: "30%", name: "Covered calls", flex: 30, dark: true },
  { pct: "30%", name: "NEAR-secured puts", flex: 30, dark: true },
  { pct: "20%", name: "Structured", flex: 20, dark: false },
];

const SAFES = [
  {
    title: "Independent custody",
    sub: "Assets sit with an independent custodian, segregated from the manager and every other cell.",
  },
  {
    title: "Hire-and-fire authority",
    sub: "Independent directors can replace cAssets; any IMA deviation triggers automatic suspension.",
  },
  {
    title: "First-loss escrow",
    sub: "50% of performance fees are escrowed for 12 months and absorb losses before any holder does.",
  },
  {
    title: "Regulatory perimeter",
    sub: "JFSC regulated, Reg S, US legal opinion from Mayer Brown. KYC at subscription and redemption.",
  },
];

export default async function HowItWorks() {
  const viewer = await requireDataroomViewer("how-it-works");
  return (
    <div className="hiw">
      <div className="halo" />
      <div className="page">
        <header className="head">
          <div className="logo">
            <span className="c">c</span>
            <span className="rest">NEAR</span>
          </div>
          <div className="head-meta">How It Works · June 2026</div>
        </header>

        <section className="hero">
          <div className="eyebrow">The mechanics, end to end</div>
          <h1>
            <span className="dim">One certificate.</span>
            <br />
            Here is everything behind it.
          </h1>
          <p className="lead">
            cNEAR is a <strong>tokenised, actively managed certificate (AMC)</strong>
            : a debt instrument issued by a protected cell of Assetize PCC in
            Jersey, managed by cAssets under a defined mandate. It is{" "}
            <strong>not a fund</strong>. You hold a certificate that tracks a
            NEAR portfolio with an active yield programme; you can subscribe,
            redeem monthly at NAV, sell on secondary, or borrow against it.
          </p>
        </section>

        <section className="sec">
          <h2 className="sec-h">
            The structure:{" "}
            <span className="g">three parties, clean separation.</span>
          </h2>
          <p className="sec-sub">
            Capital, custody, and management are held by different hands. No
            single party, including the manager, can touch all three.
          </p>
          <div className="diagram">
            <div className="dstack">
              <div className="dbox dbox-light">
                <div className="dbox-l">Certificate holders</div>
                <div className="dbox-t">Investors</div>
                <div className="dbox-s">
                  Qualified non-US investors and institutions. Reg S.
                </div>
              </div>
            </div>
            <div className="dlink">
              <span className="arr">&#8596;</span>
              <span className="lbl">Subscribe / redeem at NAV</span>
            </div>
            <div className="dbox dbox-ink">
              <div className="dbox-l">The issuer</div>
              <div className="dbox-t">cNEAR Cell</div>
              <div className="dbox-s">
                Protected cell of Assetize PCC, Jersey, JFSC regulated. Holds
                the NEAR portfolio with an independent custodian, segregated
                from every other party.
              </div>
            </div>
            <div className="dlink">
              <span className="arr">&#8596;</span>
              <span className="lbl">Manages under IMA</span>
            </div>
            <div className="dstack">
              <div className="dbox dbox-light">
                <div className="dbox-l">The manager</div>
                <div className="dbox-t">cAssets</div>
                <div className="dbox-s">
                  Jersey ManCo. Runs the strategy within the mandate. Cannot
                  withdraw assets.
                </div>
              </div>
            </div>
          </div>
          <div className="doversight">
            <div className="obox">
              <div className="dbox-l">Oversight</div>
              <div className="dbox-s">
                An independent{" "}
                <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
                  Investment Oversight Committee
                </strong>{" "}
                holds unrestricted information rights and a strategy veto;
                Cavenwell&apos;s independent directors hold sole authority to
                hire and fire the manager. Half of every performance fee sits
                in a 12-month first-loss escrow between issuer and manager.
              </div>
            </div>
          </div>
        </section>

        <section className="sec">
          <h2 className="sec-h">
            The flow:{" "}
            <span className="g">from subscription to redemption.</span>
          </h2>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step" key={s.title}>
                <div className="step-t">{s.title}</div>
                <div className="step-s">{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="sec">
          <h2 className="sec-h">
            The strategy: <span className="g">four sleeves, one target.</span>
          </h2>
          <p className="sec-sub">
            A premium-harvest programme around a directional NEAR core. Sleeve
            weights are managed within the mandate.
          </p>
          <div className="alloc">
            {ALLOC.map((a) => (
              <div
                key={a.name}
                className={a.dark ? "alloc-seg dark" : "alloc-seg"}
                style={{ flex: a.flex }}
              >
                <div className="alloc-pct">{a.pct}</div>
                <div className="alloc-name">{a.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="sec">
          <h2 className="sec-h">
            The safeguards: <span className="g">structural, not promised.</span>
          </h2>
          <div className="safes">
            {SAFES.map((s) => (
              <div className="safe" key={s.title}>
                <div className="safe-t">{s.title}</div>
                <div className="safe-s">{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="foot">
          <a className="foot-mail" href="mailto:investors@cassets.xyz">
            investors@cassets.xyz
          </a>
          <div className="foot-fine">
            cNEAR is an actively managed certificate issued by Assetize PCC
            (Jersey), managed by cAssets Management Ltd. For qualified non-US
            institutional investors only. Yield figures are targets, not
            guarantees. Not financial advice; not an offer to sell. June 2026.
          </div>
        </footer>
      </div>
      {viewer && (
        <FeedbackPanel doc="how-it-works" viewerEmail={viewer.email} />
      )}
    </div>
  );
}
