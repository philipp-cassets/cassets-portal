import type { Metadata } from "next";
import { requireDataroomViewer } from "@/lib/dataroom";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import {
  ConfTvlChart,
  IntentsVolChart,
  PsChart,
  ScenChart,
  YcChart,
} from "./thesis-charts";
import "./thesis.css";

/**
 * cNEAR investment thesis document, recreated pixel-faithfully from the
 * design handoff "cNEAR Investment Thesis.html" (Glass Light direction).
 * Static content plus client-rendered Chart.js charts; no investor data is
 * queried or rendered here.
 */
const DESCRIPTION =
  "A bottom-up thesis for the protocol that built the settlement layer for the agentic economy, and is still priced as if no one has noticed.";

export const metadata: Metadata = {
  title: "The Case for NEAR · cAssets Investment Thesis",
  description: DESCRIPTION,
  openGraph: {
    title: "The Case for NEAR · cAssets Investment Thesis",
    description: DESCRIPTION,
    type: "website",
    siteName: "cNEAR",
  },
};

const ARGUMENT = [
  {
    title: "The asset",
    body: "Privacy, agentic payments, and AI infrastructure are converging on one L1 that spent five years building for this moment.",
  },
  {
    title: "The moment",
    body: "The flywheel just switched on: deflationary threshold crossed, fee capture nearly tripled in 90 days, institutional catalysts live.",
  },
  {
    title: "The math",
    body: "Volume drives fees, fees drive value. A bottom-up model puts NEAR at $4.70 to $35 over one to three years.",
  },
  {
    title: "The problem",
    body: "Conviction has no good vehicle. Passive holding earns nothing; funds lock capital and block most allocators.",
  },
  {
    title: "The vehicle",
    body: "cNEAR: an actively managed certificate. ~12.6% net yield in NEAR, full control, institutional governance.",
  },
];

const PILLARS = [
  {
    n: "01",
    title: "Directional bet",
    sub: "The full NEAR position. 70% of the book captures every dollar of price appreciation directly.",
  },
  {
    n: "02",
    title: "Staking yield",
    sub: "~4.7% per year earned automatically. More NEAR accruing while you hold.",
  },
  {
    n: "03",
    title: "Structured yield",
    sub: "An active options strategy adds ~8% more. Total target: 12.6% per year, denominated in NEAR.",
  },
  {
    n: "04",
    title: "Collateral unlock",
    sub: "Borrow against the position. Access capital or leverage without selling.",
  },
  {
    n: "05",
    title: "Market control",
    sub: "Sell on secondary any time. Redeem monthly at NAV. Size up or down whenever you want.",
  },
];

export default async function Thesis() {
  const viewer = await requireDataroomViewer("thesis");
  return (
    <div className="thesis">
      <nav className="nav">
        <a className="logo" href="#">
          <span className="c">c</span>
          <span className="near">NEAR</span>
        </a>
        <div className="nav-links">
          <a href="#argument">THE ARGUMENT</a>
          <a href="#asset">THE ASSET</a>
          <a href="#moment">THE MOMENT</a>
          <a href="#math">THE MATH</a>
          <a href="#problem">THE PROBLEM</a>
          <a href="#vehicle">THE VEHICLE</a>
        </div>
        <a className="nav-cta" href="mailto:investors@cassets.xyz">
          investors@cassets.xyz
        </a>
      </nav>

      {/* COVER */}
      <header className="cover">
        <div className="cover-halo" />
        <div className="glyph-wrap glyph-l">
          <div className="glyph" />
        </div>
        <div className="glyph-wrap glyph-r">
          <div className="glyph" />
        </div>
        <div className="stamp">
          cAssets Management · Investment Thesis · June 2026 · Confidential
        </div>
        <h1>
          <span className="l1">cAsset Suite #001</span>
          <span className="l2">The Case for NEAR</span>
        </h1>
        <p className="lead">
          A bottom-up thesis for the protocol that built the settlement layer
          for the agentic economy, and is still priced as if no one has
          noticed.
        </p>
        <div className="cover-stats">
          <div className="cstat">
            <div className="cstat-n">$2.00</div>
            <div className="cstat-l">NEAR price today</div>
            <div className="cstat-d">
              Up 100%+ in 30 days. The market is waking up.
            </div>
          </div>
          <div className="cstat">
            <div className="cstat-n">$2.6B</div>
            <div className="cstat-l">Market cap</div>
            <div className="cstat-d">Still mispriced against fundamentals.</div>
          </div>
          <div className="cstat">
            <div className="cstat-n">$20B+</div>
            <div className="cstat-l">Intents volume, all-time</div>
            <div className="cstat-d">$108M/day 7-day average and climbing.</div>
          </div>
          <div className="cstat">
            <div className="cstat-n">$224M</div>
            <div className="cstat-l">June 5 record day</div>
            <div className="cstat-d">
              Crossed the deflationary threshold for the first time.
            </div>
          </div>
        </div>
        <div className="cover-legal">
          Prepared by cAssets Management Ltd · June 2026 · Point-in-time
          document · Data from Dune Analytics, DefiLlama, NEAR Foundation, SVRN
          Research, Bitwise, Nansen, and Messari. Not financial advice. Not an
          offer to sell. Confidential, not for redistribution.
        </div>
      </header>

      {/* THE ARGUMENT */}
      <section className="argument" id="argument">
        <div className="eyebrow">The argument</div>
        <h2 className="sec-h">One thesis, five steps. Each one stands on the last.</h2>
        <div className="arg-steps">
          {ARGUMENT.map((a) => (
            <div className="arg" key={a.title}>
              <div className="arg-t">{a.title}</div>
              <div className="arg-b">{a.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PART I */}
      <div className="part" id="asset">
        <div className="part-inner">
          <div className="part-n">Part I · The Asset</div>
          <div className="part-t">
            Three structural shifts.
            <br />
            <span className="dim">One protocol built for all three.</span>
          </div>
          <div className="part-s">
            Most L1 theses ride one narrative. NEAR&apos;s case rests on three
            reaching inflection at once, and NEAR is the only protocol
            architected from the ground up to capture all of them.
          </div>
        </div>
      </div>

      <section className="sec">
        <div className="eyebrow">Layer 01 · The Convergence</div>
        <h2 className="sec-h">
          The most mispriced large-cap protocol{" "}
          <span className="g">in crypto right now.</span>
        </h2>
        <p className="sec-sub">
          Privacy, agentic payments, and AI infrastructure are not three
          separate bets. On NEAR they are one system: private execution rails
          that AI agents use to move money, run on infrastructure no one has to
          trust.
        </p>

        <div className="nar-rows">
          <div className="nar-row">
            <div className="nar-num">I</div>
            <div>
              <div className="nar-t">Privacy</div>
              <div className="nar-b">
                Public blockchains show everything. Institutions need
                discretion; enterprises need privacy. NEAR&apos;s Confidential
                Compute and Confidential Intents solve both, and they are the
                only production infrastructure in crypto that does.
              </div>
            </div>
            <div className="nar-stat">
              <div className="nar-sv">$184B</div>
              <div className="nar-sl">
                Confidential compute market by 2030 · Grand View Research
              </div>
            </div>
          </div>
          <div className="nar-row">
            <div className="nar-num">II</div>
            <div>
              <div className="nar-t">Agentic Payments</div>
              <div className="nar-b">
                AI agents execute transactions on your behalf, across dozens of
                chains. They need rails that just work. NEAR Intents is the
                only production-grade cross-chain execution layer at scale:
                $20.6B+ volume across 35+ chains.
              </div>
            </div>
            <div className="nar-stat">
              <div className="nar-sv">$3–5T</div>
              <div className="nar-sl">
                Agentic commerce TAM by 2030 · $190–500B agent-executed
                payments
              </div>
            </div>
          </div>
          <div className="nar-row">
            <div className="nar-num">III</div>
            <div>
              <div className="nar-t">AI Infrastructure</div>
              <div className="nar-b">
                When AI runs your money and your data, who does it answer to?
                NEAR AI Cloud, IronClaw, and Confidential Compute form the only
                verifiable, decentralised AI layer in production. The market
                prices it at zero.
              </div>
            </div>
            <div className="nar-stat">
              <div className="nar-sv">~$0</div>
              <div className="nar-sl">
                Current market price of NEAR&apos;s AI stack
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="eyebrow">Layer 02 · Privacy</div>
        <h2 className="sec-h">
          Privacy is <span className="g">the institutional unlock.</span>
        </h2>
        <p className="sec-sub">
          On a public chain, every move is visible before you make it. For
          institutions moving real size, or AI handling sensitive data, that is
          a fundamental problem. NEAR built the solution. Nobody else has.
        </p>

        <div className="cards cards-4">
          <div className="card">
            <div className="card-l">Confidential TVL</div>
            <div className="card-v g">$18.9M</div>
            <div className="card-s">
              Up 580% in 90 days. 42% of all near.com swap volume now runs in
              confidential mode.
            </div>
            <div className="card-a">~4 months from zero</div>
          </div>
          <div className="card">
            <div className="card-l">Market by 2030</div>
            <div className="card-v">$184B</div>
            <div className="card-s">
              Confidential compute today is AWS Nitro, Azure, Google CVMs. All
              centralised.
            </div>
          </div>
          <div className="card">
            <div className="card-l">MEV losses</div>
            <div className="card-v">$1B+</div>
            <div className="card-s">
              Annual DeFi losses to frontrunning. Every dollar is a potential
              Confidential Intents user.
            </div>
          </div>
          <div className="card">
            <div className="card-l">Status</div>
            <div className="card-v g" style={{ fontSize: 22, fontWeight: 600 }}>
              Live
            </div>
            <div className="card-s">
              Confidential Intents in production on near.com. Swaps, transfers,
              deposits, withdrawals.
            </div>
          </div>
        </div>

        <p className="body">
          Confidential Intents lets institutions execute privately across any
          chain: the position stays hidden from the market while it executes,
          but remains fully auditable for compliance. That balance between
          discretion and a verifiable record is standard in traditional
          finance. In crypto it has never existed until now. When it launched
          in March 2026, NEAR appreciated <strong>17% in 24 hours</strong>; the
          market understood immediately.
        </p>
        <p className="body">
          NEAR AI extends the same guarantee to computation. Models run inside
          hardware-sealed vaults that even the server owner cannot see into,
          and every computation produces an independently verifiable
          certificate. <strong>Brave, Venice AI, and OpenMind</strong> already
          use it in production; NVIDIA and Intel are the compute partners. At
          SALT Bermuda 2026, the <strong>Government of Bermuda</strong> chose
          NEAR AI to run public-sector AI on sensitive citizen data, because
          the infrastructure provider is cryptographically locked out at the
          architectural level.
        </p>

        <div className="chart">
          <div className="chart-h">
            Confidential Intents TVL, daily (Mar 2026), projected to year-end
          </div>
          <div className="chart-s">
            From zero to ~$19M in four months, up 580% in 90 days. Dashed line:
            indicative projection at the recent growth rate, decaying
            quarterly, reaching ~$155M by December 2026. Not a forecast.
          </div>
          <div style={{ position: "relative", height: 200 }}>
            <ConfTvlChart />
          </div>
        </div>

        <div className="bridge">
          <span className="arrow">Why this matters next:</span> privacy is the
          feature institutions were waiting for. The next layer is what they
          use it for: payments, and the rails built to carry an agent economy.
        </div>
      </section>

      <section className="sec">
        <div className="eyebrow">Layer 03 · Agentic Payments</div>
        <h2 className="sec-h">
          A $3–5T agent economy by 2030.{" "}
          <span className="g">The rails are built to handle it.</span>
        </h2>
        <p className="sec-sub">
          The market sizing now comes in tiers: $3–5T of global agentic
          commerce by 2030, of which $190–500B is agent-executed payments and
          settlement, the part that needs rails like NEAR&apos;s. The
          serviceable market today, $20B+ of human-initiated cross-chain swaps,
          already runs through NEAR Intents.
        </p>

        <div className="cards cards-3">
          <div className="card">
            <div className="card-l">All-time volume</div>
            <div className="card-v g">$20B+</div>
            <div className="card-s">
              18 months from launch. Over 10% of it in the last 30 days.
            </div>
          </div>
          <div className="card">
            <div className="card-l">Monthly active users</div>
            <div className="card-v">553K</div>
            <div className="card-s">
              132K in the last 7 days; 24% weekly retention.
            </div>
          </div>
          <div className="card">
            <div className="card-l">Chains integrated</div>
            <div className="card-v">35+</div>
            <div className="card-s">
              Bitcoin, Ethereum, Solana, Base, TON, and 30 more. Growing
              weekly.
            </div>
          </div>
        </div>

        <div className="bridge">
          <span className="arrow">Why this matters next:</span> the rails exist
          and the prize is enormous. The next layer is the intelligence that
          will route flow onto them, and who is building it.
        </div>
      </section>

      <section className="sec">
        <div className="eyebrow">Layer 04 · AI Infrastructure</div>
        <h2 className="sec-h">
          Priced at zero.{" "}
          <span className="g">
            In production, built by the only founder in crypto with a real
            claim to AI.
          </span>
        </h2>
        <p className="sec-sub">
          NEAR&apos;s AI stack is the only decentralised, verifiable AI
          infrastructure serving production workloads, and it already runs
          inside consumer products like Brave&apos;s browser AI and Venice.
          Millions of users touch it daily. The market prices it at
          approximately zero. It is not zero.
        </p>

        <p className="body">
          Illia Polosukhin co-authored{" "}
          <strong>&quot;Attention Is All You Need&quot;</strong> (2017), the
          paper behind every frontier AI model. When AI scaled beyond research
          he had a choice: build a centralised AI company, or build the
          infrastructure that keeps AI open, user-owned, and verifiable. He
          chose the infrastructure.
        </p>

        <div className="stack">
          <div className="si s1">
            <div className="sl">User surface</div>
            <div className="sn">
              near.com<span className="stag">Live · 35+ chains</span>
            </div>
            <div className="sd">
              Multi-chain super-app. Every transaction pays $NEAR fees.
            </div>
          </div>
          <div className="si s2">
            <div className="sl">Agentic demand</div>
            <div className="sn">
              NEAR AI<span className="stag">IronClaw · Private inference</span>
            </div>
            <div className="sd">
              Compute and inference fees flow to $NEAR buybacks.
            </div>
          </div>
          <div className="si s3">
            <div className="sl">Coordination</div>
            <div className="sn">
              NEAR Intents<span className="stag">Confidential · $20B+</span>
            </div>
            <div className="sd">
              Fee switch active. 100% native, 50% partner flows to $NEAR.
            </div>
          </div>
          <div className="si s4">
            <div className="sl">Value capture</div>
            <div className="sn">
              NEAR Protocol<span className="stag">Deflationary · 1M TPS</span>
            </div>
            <div className="sd">Every layer above pays into $NEAR.</div>
          </div>
        </div>

        <p className="body">
          Amazon, Microsoft, and Google all sell confidential compute; it
          generates billions across their cloud portfolios. None of it is
          decentralised, none is user-verifiable, none lets you own the agents
          or the data they process. NEAR&apos;s framing for the category is{" "}
          <strong>AI Money</strong>: every need eventually settles on one
          default (search on Google, cloud on AWS), and NEAR is positioning to
          be the default for money that AI agents move. The stack for it is
          shipping now: IronClaw as the agent OS, Agent Market 2.0 launching in
          Q3 as a marketplace where agents are hired, escrowed, and paid
          on-chain, and Confidential Cloud underneath. The market prices all of
          it at zero today, not because it is inferior, but because no
          framework exists for it yet. When one does, the comparison will not
          be NEAR versus other blockchains. It will be NEAR versus cloud
          infrastructure.
        </p>

        <div className="bridge">
          <span className="arrow">Why this matters next:</span> the AI stack is
          a free option layered on top of the Intents revenue engine. That is
          the asset. What follows is the timing: the flywheel switched on in
          the last 90 days.
        </div>
      </section>

      {/* PART II: THE MOMENT */}
      <div className="part" id="moment">
        <div className="part-inner">
          <div className="part-n">Part II · The Moment</div>
          <div className="part-t">
            The flywheel just switched on.
            <br />
            <span className="dim">
              Threshold crossed. Capture tripled. Catalysts live.
            </span>
          </div>
          <div className="part-s">
            A thesis can be right and early forever. This one stopped being
            early in the last 90 days. The numbers below are what changed, and
            why the window is now.
          </div>
        </div>
      </div>

      <section className="sec">
        <div className="eyebrow">Layer 05 · The Flywheel</div>
        <h2 className="sec-h">
          June 5, 2026:{" "}
          <span className="g">NEAR&apos;s first net-deflationary day.</span>
        </h2>
        <p className="sec-sub">
          NEAR Intents processed a record $224M in one day, generating revenue
          47% above the deflationary level. The 7-day average now sits at
          $108M/day, and the capture rate behind every dollar is compounding.
        </p>

        <div className="cards cards-3">
          <div className="card">
            <div className="card-l">Jun 5 record</div>
            <div className="card-v g">$224M</div>
            <div className="card-s">
              $279K revenue that day: 47% above the deflationary level. NEAR
              was net deflationary for the first time in its history.
            </div>
          </div>
          <div className="card">
            <div className="card-l">Fee capture, 30 days</div>
            <div className="card-v g">30.5%</div>
            <div className="card-s">
              From 11.5% lifetime to 17.9% over 90 days to 30.5% in the last
              30: a 2.7x acceleration.
            </div>
          </div>
          <div className="card">
            <div className="card-l">7-day average</div>
            <div className="card-v">$108M</div>
            <div className="card-s">
              Daily volume, against the $177M/day deflationary threshold. The
              base case crosses in 2026.
            </div>
          </div>
        </div>

        <div className="chart">
          <div className="chart-h">
            NEAR Intents daily volume, history and projections to June 2027
          </div>
          <div className="chart-s">
            Historical data from Dune Analytics. Projections from the Jun 1,
            2026 baseline of $130M/day. Bear: 4% MoM. Base: 10% MoM. Bull: 18%
            MoM, with quarterly decay. Deflationary threshold: $177M/day.
          </div>
          <div style={{ position: "relative", height: 240 }}>
            <IntentsVolChart />
          </div>
          <div className="legend">
            <span>
              <i style={{ borderColor: "#00A875" }} />
              Historical
            </span>
            <span>
              <i style={{ borderColor: "#05050C", borderTopStyle: "dashed" }} />
              Bull
            </span>
            <span>
              <i style={{ borderColor: "#B07A29", borderTopStyle: "dashed" }} />
              Base
            </span>
            <span>
              <i style={{ borderColor: "#B0492F", borderTopStyle: "dashed" }} />
              Bear
            </span>
            <span>
              <i style={{ borderColor: "#B07A29", borderTopStyle: "dotted" }} />
              Deflationary threshold
            </span>
          </div>
        </div>

        <div className="spot">
          <div>
            <div className="spot-k">Live catalyst · Hyperliquid integration</div>
            <div className="spot-t">
              Two of the biggest metas in crypto are now connected. Live.
            </div>
            <p>
              NEAR Intents has launched private deposits and withdrawals on the
              dominant on-chain perps venue via Confidential Intents: $2.5M of
              volume in the first 24 hours. The prize is the bridge flow
              itself; if it routes through NEAR Intents, it alone pushes NEAR
              past the deflationary threshold. <strong>Permanently.</strong>
            </p>
            <p>
              The second-order effect is bigger: private funding opens the
              venue to whales and desks who avoided it because positions were
              transparent. That is <strong>net new flow</strong>, not rerouted
              volume.
            </p>
          </div>
          <div className="spot-stats">
            <div className="spot-stat">
              <div className="spot-sv">$3.1B</div>
              <div className="spot-sl">
                Hyperliquid bridge flow per month, ~$105M/day
              </div>
            </div>
            <div className="spot-stat">
              <div className="spot-sv">$177M</div>
              <div className="spot-sl">
                Daily deflationary threshold this flow alone would clear
              </div>
            </div>
          </div>
        </div>

        <div className="spot">
          <div>
            <div className="spot-k">Live example · Abound × NEAR AI</div>
            <div className="spot-t">
              Agentic remittances, running today in India.
            </div>
            <p>
              Abound, backed by The Times of India Group, deploys IronClaw
              agents for cross-border financial services. The user states the
              outcome; the agent routes optimally across chains via NEAR
              Intents and settles on NEAR.
            </p>
            <p>
              <strong>Live infrastructure, real remittances</strong>, targeting
              a $135B annual market.
            </p>
          </div>
          <div className="spot-stats">
            <div className="spot-stat">
              <div className="spot-sv">500K+</div>
              <div className="spot-sl">Monthly active users</div>
            </div>
            <div className="spot-stat">
              <div className="spot-sv">130+</div>
              <div className="spot-sl">Indian banks connected</div>
            </div>
            <div className="spot-stat">
              <div className="spot-sv">$135B</div>
              <div className="spot-sl">Annual remittance market targeted</div>
            </div>
          </div>
        </div>

        <p className="body">
          Volume is half the story. The revenue behind it is inflecting faster:
          in April 2026 NEAR switched on fee-sharing for third-party
          integrations. The protocol&apos;s capture rate has gone from{" "}
          <strong>
            11.5% lifetime to 17.9% over 90 days to 30.5% in the last 30 days
          </strong>
          , a 2.7x acceleration that is still compounding as integrations
          formalise. At ~30% capture, the volume needed for the same buyback
          pressure falls by roughly two thirds. Volume growth and margin
          expansion are compounding each other, and new fee surfaces keep
          stacking: quote-improvement fees already run at{" "}
          <strong>~$0.85M/yr</strong>, tokenized RWAs are live on Intents (gold
          now, US equities and treasuries launching), and institutional order
          flow is signed with the largest OEM execution stack.
        </p>

        <div className="bridge">
          <span className="arrow">Why this matters next:</span> revenue is no
          longer hypothetical, so the protocol can be valued like a business.
          The next part does exactly that, from observable fees up.
        </div>
      </section>

      <div className="part" id="math">
        <div className="part-inner">
          <div className="part-n">Part III · The Math</div>
          <div className="part-t">
            Volume → fees → buybacks.
            <br />
            <span className="dim">At $177M/day, NEAR turns deflationary.</span>
          </div>
          <div className="part-s">
            No narrative, no guesswork. Volume through Intents generates fees;
            fees fund NEAR buybacks. Past $177M/day of volume, buybacks outpace
            issuance and supply shrinks while revenue grows. Market cap
            re-rates on that revenue, and price is a function of market cap.
            Every number is live, every assumption stated.
          </div>
        </div>
      </div>

      <section className="sec">
        <div className="eyebrow">Layer 06 · How We Value NEAR</div>
        <h2 className="sec-h">
          We value NEAR on on-chain activity.{" "}
          <span className="g">Price has not caught up.</span>
        </h2>
        <p className="sec-sub">
          Our valuation rests on what the protocol verifiably does: volume
          settled, fees generated, value captured. On that basis NEAR is
          underpriced; the price has lagged its own fundamentals even after the
          recent move. And two things are not priced in at all: the agentic
          commerce opportunity, and the capability, with Illia Polosukhin
          behind the AI stack, to own that space outright.
        </p>

        <div className="chart">
          <div className="chart-h">
            P/S versus L1 peers, Intents-adjusted revenue
          </div>
          <div className="chart-s">
            The market still prices NEAR on legacy L1 gas revenue. Priced on
            the activity actually settling through Intents, it is the cheapest
            scaled L1.
          </div>
          <div style={{ position: "relative", height: 200 }}>
            <PsChart />
          </div>
        </div>

        <table className="dt">
          <thead>
            <tr>
              <th>Daily Intents volume</th>
              <th>Ann. fees (~17bps)</th>
              <th>30x conservative</th>
              <th>50x base</th>
              <th>80x AI premium</th>
              <th>NEAR price (50x)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="tb">$107M (7-day avg)</td>
              <td>~$66M</td>
              <td>$2.0B</td>
              <td>$3.3B</td>
              <td>$5.3B</td>
              <td className="tg">$2.82</td>
            </tr>
            <tr className="hl">
              <td className="tb">$177M (deflationary threshold)</td>
              <td>~$110M</td>
              <td>$3.3B</td>
              <td>$5.5B</td>
              <td>$8.8B</td>
              <td className="tg">$4.70</td>
            </tr>
            <tr>
              <td className="tb">$300M</td>
              <td>~$186M</td>
              <td>$5.6B</td>
              <td>$9.3B</td>
              <td>$14.9B</td>
              <td className="tg">$7.95</td>
            </tr>
            <tr>
              <td className="tb">$500M</td>
              <td>~$310M + AI fees</td>
              <td>$9.3B</td>
              <td>$18.5B</td>
              <td>$28.8B</td>
              <td className="tg">$15.81</td>
            </tr>
            <tr>
              <td className="tb">$1B</td>
              <td>~$620M + AI fees</td>
              <td>$18.6B</td>
              <td>$41B</td>
              <td>$65.6B</td>
              <td className="tg">$35.04</td>
            </tr>
          </tbody>
        </table>
        <div className="fine">
          Assumptions: 17bps blended fee rate (current Dune data), 1.17B
          circulating NEAR, fully unlocked. 30x = mature L1 comparable. 50x =
          base growth premium. 80x = AI infrastructure re-rating. Modelled
          estimates, not forecasts. NEAR AI fees are excluded entirely: an
          illustrative $50M of AI revenue at 50x would add ~$2.14 to the
          implied price on top of everything above.
        </div>
      </section>

      <section className="sec">
        <div className="eyebrow">Layer 07 · Scenarios</div>
        <h2 className="sec-h">
          One to three year horizons. <span className="g">Bear, base, bull.</span>
        </h2>
        <p className="sec-sub">
          Three scenarios from the June 1, 2026 baseline of $130M/day, with
          growth decaying quarterly. Prices derive from projected volume, fee
          generation, and multiple expansion.
        </p>

        <div className="chart">
          <div className="chart-h">
            NEAR price scenarios at 1, 2, and 3 years (entry: $2.00)
          </div>
          <div className="chart-s">
            NEAR AI fees modelled as additive revenue from year 2. Multiple
            assumptions as in the table above.
          </div>
          <div style={{ position: "relative", height: 260 }}>
            <ScenChart />
          </div>
        </div>

        <div className="cards cards-3">
          <div className="card" style={{ borderTop: "2px solid #B0492F" }}>
            <div className="card-l" style={{ color: "#B0492F" }}>
              Bear · 4% MoM
            </div>
            <div className="card-v" style={{ fontSize: 22 }}>
              $2.50 / $3.50 / $4.80
            </div>
            <div className="card-s">
              Growth slows and stalls. The AI stack generates no meaningful
              revenue. NEAR stays a useful but niche blockchain.
            </div>
          </div>
          <div className="card" style={{ borderTop: "2px solid #B07A29" }}>
            <div className="card-l" style={{ color: "#B07A29" }}>
              Base · 10% MoM
            </div>
            <div className="card-v" style={{ fontSize: 22 }}>
              $4.70 / $8.50 / $15.80
            </div>
            <div className="card-s">
              Net deflationary by late 2026. NEAR AI begins generating real
              fees. The market reprices NEAR as infrastructure with compounding
              revenue. Independent cross-check: SVRN&apos;s bottom-up model
              puts a 12-month re-rate at $4.65–5.60.
            </div>
          </div>
          <div className="card" style={{ borderTop: "2px solid #00C887" }}>
            <div className="card-l" style={{ color: "#00744F" }}>
              Bull · 18% MoM
            </div>
            <div className="card-v" style={{ fontSize: 22 }}>
              $8.00 / $18.00 / $35.00
            </div>
            <div className="card-s">
              Enterprises adopt Confidential Intents at scale. Investors
              compare NEAR to cloud infrastructure, not blockchains.
            </div>
          </div>
        </div>

        <div className="pq">
          <div className="pq-t">
            &quot;Make no mistake: NEAR is a swing-for-the-fences bet. If it
            delivers on its vision, it could be a trillion-dollar asset. If it
            fails, and there is real execution risk in a project this size, it
            will have little or no value. But it has a real shot and is making
            extraordinary progress. Among all the crypto projects in the world,
            it is one that bears watching.&quot;
          </div>
          <div className="pq-a">
            Bitwise Asset Management · The Investment Case for NEAR · Q2 2025
          </div>
        </div>

        <p className="body">
          The risk is real and we name it honestly. If the vision plays out,
          the scenarios above show 2 to 17x from today, and our model is the
          conservative one: scenario work from SVRN and Bitwise puts NEAR at{" "}
          <strong>
            $10–15 by 2030 if agent volume stalls, and $130–180 if NEAR becomes
            the settlement standard for the agent economy
          </strong>
          . If it does not play out, the downside is severe. There is no middle
          ground on a bet this size.
        </p>

        <div className="bridge">
          <span className="arrow">Why this matters next:</span> if you accept
          the math, the question stops being &quot;is NEAR cheap&quot; and
          becomes &quot;what is the best instrument to hold it.&quot; That
          question has a surprisingly bad set of answers.
        </div>
      </section>

      {/* PART IV */}
      <div className="part" id="problem">
        <div className="part-inner">
          <div className="part-n">Part IV · The Problem</div>
          <div className="part-t">
            Conviction is easy.
            <br />
            <span className="dim">Expressing it well is not.</span>
          </div>
          <div className="part-s">
            Passive holding pays the full cost of volatility and earns nothing
            while the thesis plays out. Funds earn yield but lock capital and
            are structurally closed to most allocators. The white space sits in
            between.
          </div>
        </div>
      </div>

      <section className="sec">
        <div className="eyebrow">Layer 08 · The Landscape</div>
        <h2 className="sec-h">
          Every vehicle plotted. One fills the{" "}
          <span className="g">white space.</span>
        </h2>
        <p className="sec-sub">
          Plot every available NEAR vehicle by yield against control and
          flexibility. The top-right quadrant, maximum yield with maximum
          control, is empty. Until cNEAR.
        </p>

        <div className="chart">
          <div className="chart-h">Yield versus control, every NEAR vehicle</div>
          <div className="chart-s">
            No existing vehicle reaches top-right. One does.
          </div>
          <div style={{ position: "relative", height: 380 }}>
            <YcChart />
          </div>
        </div>

        <div className="cards cards-3">
          <div className="card" style={{ borderTop: "2px solid #B0492F" }}>
            <div className="card-l" style={{ color: "#B0492F" }}>
              Fund structures
            </div>
            <div
              className="card-v"
              style={{ fontSize: 20, fontWeight: 600, color: "#B0492F" }}
            >
              Blocked
            </div>
            <div className="card-s">
              VC fund-of-funds restrictions prevent investment. Capital locked
              until maturity. No token, no secondary, no collateral, no
              control.
            </div>
          </div>
          <div className="card" style={{ borderTop: "2px solid #B07A29" }}>
            <div className="card-l" style={{ color: "#B07A29" }}>
              ETPs / ETFs / direct
            </div>
            <div
              className="card-v"
              style={{ fontSize: 20, fontWeight: 600, color: "#B07A29" }}
            >
              Beta only
            </div>
            <div className="card-s">
              Liquid and mandate-compatible, but 0 to 4.7% yield at most. No
              active management, no collateral, no compounding mechanics.
            </div>
          </div>
          <div className="card" style={{ borderTop: "2px solid #00C887" }}>
            <div className="card-l" style={{ color: "#00744F" }}>
              cNEAR · AMC
            </div>
            <div className="card-v g" style={{ fontSize: 20, fontWeight: 600 }}>
              Accessible + yield
            </div>
            <div className="card-s">
              A debt instrument, not a fund. VCs that can hold debt and liquid
              tokens can hold cNEAR. ~12.6% active yield with full control.
            </div>
          </div>
        </div>

        <div className="callout">
          <div className="callout-k">
            TradFi anchor · Actively Managed Certificates
          </div>
          <p>
            European private banks (Leonteq, Vontobel, Julius Baer) have issued
            AMCs for 20+ years: actively managed strategies in a debt
            certificate, tradeable on secondary, accessible where fund units
            are blocked. cNEAR applies this proven structure to digital assets
            with DeFi yield mechanics for the first time.{" "}
            <strong>The structure is established. The asset class is new.</strong>
          </p>
        </div>

        <div className="bridge">
          <span className="arrow">Why this matters next:</span> the white space
          is not an accident; it exists because building this structure
          properly is hard. The final part shows how cNEAR fills it, and what
          keeps the manager honest.
        </div>
      </section>

      {/* PART V */}
      <div className="part" id="vehicle">
        <div className="part-inner">
          <div className="part-n">Part V · The Vehicle</div>
          <div className="part-t">
            If you&apos;re long NEAR,
            <br />
            <span className="dim">nothing else comes close.</span>
          </div>
          <div className="part-s">
            The yield covers your cost of capital while the thesis plays out.
            The structure gives you control throughout. The compounding
            mechanics work for you, not against you.
          </div>
        </div>
      </div>

      <section className="sec">
        <div className="eyebrow">Layer 09 · Five Engines</div>
        <h2 className="sec-h">
          One position.{" "}
          <span className="g">Five engines, running simultaneously.</span>
        </h2>
        <p className="sec-sub">
          In a fund you give up your capital. In cNEAR you keep it. You do not
          choose between yield and control, or between compounding and
          liquidity.
        </p>

        <div className="pillars">
          {PILLARS.map((p) => (
            <div className="pillar" key={p.n}>
              <div className="pillar-n">{p.n}</div>
              <div className="pillar-t">{p.title}</div>
              <div className="pillar-s">{p.sub}</div>
            </div>
          ))}
        </div>

        <p className="body">
          In every scenario the yield changes the outcome: in the bear case you
          accumulate more NEAR at lower prices; in the base case you compound
          on top of appreciation; in the bull case the yield barely registers
          against the gains. The yield does not remove the risk. It makes every
          outcome on the non-catastrophic path materially better.
        </p>
      </section>

      <section className="sec">
        <div className="eyebrow">Layer 10 · The Waterfall</div>
        <h2 className="sec-h">
          17% gross. 12.6% net. <span className="g">NEAR-denominated.</span>
        </h2>
        <p className="sec-sub">
          The high-water mark is expressed in NEAR tokens: a USD price decline
          creates no performance fee liability. The manager must recover
          NEAR-denominated NAV before earning performance fees.
        </p>

        <div className="wf">
          <div className="wfr wf-g">
            <div>
              <div className="wfl">Gross strategy return</div>
              <div className="wfs">Premium harvest · staking · structured</div>
            </div>
            <div className="wfv g">~17.0%</div>
          </div>
          <div className="wfr wf-d">
            <div>
              <div className="wfl">Management fee</div>
              <div className="wfs">
                2.00% p.a. all-in: custody, issuance, hedging, operations
              </div>
            </div>
            <div className="wfv r">−2.00%</div>
          </div>
          <div className="wfr wf-d">
            <div>
              <div className="wfl">Hard hurdle</div>
              <div className="wfs">
                5.00%: performance fee only above this threshold
              </div>
            </div>
            <div className="wfv" style={{ color: "var(--mut)" }}>
              5.00%
            </div>
          </div>
          <div className="wfr wf-d">
            <div>
              <div className="wfl">Performance fee</div>
              <div className="wfs">
                20% above hurdle · NEAR high-water mark · 50% escrowed as
                first-loss
              </div>
            </div>
            <div className="wfv r">−2.40%</div>
          </div>
          <div className="wfr wf-n">
            <div>
              <div className="wfl">Net to certificate holder</div>
              <div className="wfs">
                NEAR-denominated, per year, plus spot appreciation on 70% of
                the book
              </div>
            </div>
            <div className="wfv">~12.6%</div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="eyebrow">Layer 11 · Governance</div>
        <h2 className="sec-h">
          The manager cannot act <span className="g">outside the mandate.</span>
        </h2>
        <p className="sec-sub">
          &quot;Who watches the manager&quot; is a prerequisite question. The
          answer is built into the structure: no single party, including
          cAssets, can deviate from the mandate without automatic consequences.
        </p>

        <div className="prots">
          <div className="prot">
            <div className="prot-n">i</div>
            <div>
              <div className="prot-t">Independent directors, Cavenwell</div>
              <div className="prot-s">
                All issuer authority sits with Cavenwell&apos;s independent
                directors, including sole power to hire and fire cAssets as
                manager. Any deviation from the IMA triggers automatic
                suspension and referral.
              </div>
            </div>
          </div>
          <div className="prot">
            <div className="prot-n">ii</div>
            <div>
              <div className="prot-t">Investment Oversight Committee</div>
              <div className="prot-s">
                Unrestricted access to all trading records, risk reports, and
                positions. Strategy veto via IMA covenant. Monthly NAV
                reporting to all holders, quarterly formal review. The IOC
                cannot be excluded from information under any circumstances.
              </div>
            </div>
          </div>
          <div className="prot">
            <div className="prot-n">iii</div>
            <div>
              <div className="prot-t">First-loss escrow</div>
              <div className="prot-s">
                50% of each performance fee is escrowed as cNEAR certificates
                for 12 months. If NAV declines, losses absorb from the escrow
                before any holder bears a loss. The manager shares the downside
                first.
              </div>
            </div>
          </div>
          <div className="prot">
            <div className="prot-n">iv</div>
            <div>
              <div className="prot-t">Token structure with no leakage</div>
              <div className="prot-s">
                <strong>Zero</strong> team allocation, <strong>zero</strong>{" "}
                dilution (subscriptions at prevailing NAV only), and a{" "}
                <strong>buy-and-burn live from day one</strong>: 50% of
                performance fee income purchases cNEAR on secondary and retires
                it. Supply falls, NAV per token rises.
              </div>
            </div>
          </div>
          <div className="prot">
            <div className="prot-n">v</div>
            <div>
              <div className="prot-t">Regulatory framework</div>
              <div className="prot-s">
                Issued by Assetize PCC (Jersey), JFSC regulated, Reg S non-US.
                US legal opinion from Mayer Brown LLP (May 2026) covering the
                Securities Act, Investment Company Act, Advisers Act, and CEA.
                KYC/KYB at subscription, re-verified at redemption.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="eyebrow">Layer 12 · The Team</div>
        <h2 className="sec-h">
          Conviction formed <span className="g">from the inside.</span>
        </h2>
        <p className="sec-sub">
          The cAssets team built its NEAR knowledge from within the ecosystem,
          through the protocol&apos;s most significant structural changes.
          Independent of the NEAR Foundation, with a pure investment mandate.
        </p>

        <div className="cards cards-3">
          <div className="card">
            <div className="card-l">Fundraise &amp; LP relations</div>
            <div className="card-v" style={{ fontSize: 19, fontWeight: 600 }}>
              David Norris
            </div>
            <div className="card-a" style={{ marginTop: 4 }}>
              FCA · ICAEW · CFO &amp; CSO, NEAR Foundation
            </div>
            <div className="card-s">
              20+ years in finance, 10+ at executive level, across banking,
              consultancy, crypto, and AI. Leads LP relationships, institutional
              fundraise, and strategy.
            </div>
          </div>
          <div className="card">
            <div className="card-l">Finance &amp; controls</div>
            <div className="card-v" style={{ fontSize: 19, fontWeight: 600 }}>
              Philipp Suarez
            </div>
            <div className="card-a" style={{ marginTop: 4 }}>
              Chartered Accountant · Head of Finance, NEAR Foundation
            </div>
            <div className="card-s">
              15+ years across audit, consultancy, crypto, and AI. Responsible
              for financial infrastructure, NAV reporting, compliance, and
              investor-grade controls.
            </div>
          </div>
          <div className="card">
            <div className="card-l">Treasury &amp; quantitative</div>
            <div className="card-v" style={{ fontSize: 19, fontWeight: 600 }}>
              Abhishek Anirudhan
            </div>
            <div className="card-a" style={{ marginTop: 4 }}>
              Treasury specialist · Quant · NEAR Foundation
            </div>
            <div className="card-s">
              Leads treasury strategy, quantitative modelling of the yield
              programme, and the data infrastructure behind NAV calculation and
              risk reporting.
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="eyebrow">Sources &amp; References</div>
        <h2 className="sec-h" style={{ fontSize: 28 }}>
          Data sources and <span className="g">further reading</span>
        </h2>
        <div className="src-grid">
          <div>
            <div className="src-h">Live data</div>
            <div className="src-list">
              <a
                href="https://dune.com/near/near-intents"
                target="_blank"
                rel="noopener"
              >
                <span className="who">Dune Analytics</span>NEAR Intents
                Dashboard
              </a>
              <a
                href="https://defillama.com/protocol/near-intents"
                target="_blank"
                rel="noopener"
              >
                <span className="who">DefiLlama</span>NEAR Intents: TVL, Fees
                &amp; Volume
              </a>
              <a
                href="https://revenue.near.org"
                target="_blank"
                rel="noopener"
              >
                <span className="who">NEAR Protocol</span>Revenue Dashboard
              </a>
              <a href="https://nearblocks.io" target="_blank" rel="noopener">
                <span className="who">NearBlocks</span>NEAR Block Explorer
              </a>
            </div>
            <div className="src-h">Independent research</div>
            <div className="src-list">
              <a
                href="https://svrn.net/research/near-protocol"
                target="_blank"
                rel="noopener"
              >
                <span className="who">SVRN Research</span>NEAR Protocol: The
                Bottom-Up Investment Case
              </a>
              <a
                href="https://bitwiseinvestments.eu/blog/special-reports/the-investment-case-for-near"
                target="_blank"
                rel="noopener"
              >
                <span className="who">Bitwise</span>The Investment Case for
                NEAR (Q2 2025)
              </a>
              <a
                href="https://research.nansen.ai/articles/nansen-s-near-quarterly-report-q4-2025"
                target="_blank"
                rel="noopener"
              >
                <span className="who">Nansen</span>NEAR Quarterly Report Q4
                2025
              </a>
              <a
                href="https://messari.io/report/state-of-near-q1-25"
                target="_blank"
                rel="noopener"
              >
                <span className="who">Messari</span>State of NEAR Q1 2025
              </a>
            </div>
            <div className="src-h">Market analysis</div>
            <div className="src-list">
              <a
                href="https://www.coindesk.com/markets/2026/03/02/near-token-jumps-17-after-confidential-intents-launch-outpaces-privacy-tokens-sector"
                target="_blank"
                rel="noopener"
              >
                <span className="who">CoinDesk</span>NEAR +17% on Confidential
                Intents Launch
              </a>
              <a
                href="https://yellow.com/news/near-protocol-hits-record-fees-with-tenfold-volume-surge-token-recovery-uncertain"
                target="_blank"
                rel="noopener"
              >
                <span className="who">Yellow.com</span>NEAR Record Fees:
                Tenfold Volume Surge
              </a>
            </div>
          </div>
          <div>
            <div className="src-h">NEAR AI &amp; product</div>
            <div className="src-list">
              <a
                href="https://near.ai/blog/near-ai-abound-cross-border-agentic-payments"
                target="_blank"
                rel="noopener"
              >
                <span className="who">NEAR AI</span>Abound × NEAR AI:
                Cross-Border Agentic Payments
              </a>
              <a
                href="https://near.ai/blog/government-of-bermuda-ai-powered-public-services"
                target="_blank"
                rel="noopener"
              >
                <span className="who">NEAR AI</span>Government of Bermuda ×
                NEAR AI
              </a>
              <a
                href="https://near.ai/blog/venice-is-now-verifiably-private-with-near-ai"
                target="_blank"
                rel="noopener"
              >
                <span className="who">NEAR AI</span>Venice Is Now Verifiably
                Private
              </a>
              <a
                href="https://brave.com/blog/browser-ai-tee/"
                target="_blank"
                rel="noopener"
              >
                <span className="who">Brave</span>Brave Leo: AI with
                Cryptographic Privacy via TEE
              </a>
            </div>
            <div className="src-h">Market size &amp; TAM</div>
            <div className="src-list">
              <div className="plain">
                <span className="who">NF / SVRN</span>Agentic commerce TAM:
                $3–5T by 2030 · SAM $190–500B (Backers Summit, Q2 2026)
              </div>
              <div className="plain">
                <span className="who">Morgan Stanley</span>Agentic commerce
                projected at $385B by 2030
              </div>
              <div className="plain">
                <span className="who">Grand View</span>Confidential compute
                market: $184B by 2030
              </div>
              <div className="plain">
                <span className="who">DeFi data</span>MEV/frontrunning losses:
                $1B+ annually
              </div>
            </div>
            <div className="src-h">Protocol documentation</div>
            <div className="src-list">
              <a href="https://near.org/papers" target="_blank" rel="noopener">
                <span className="who">NEAR Protocol</span>White Paper &amp;
                Nightshade Sharding
              </a>
              <a
                href="https://near.org/blog/evolving-near-tokenomics"
                target="_blank"
                rel="noopener"
              >
                <span className="who">NEAR Foundation</span>Evolving NEAR
                Tokenomics
              </a>
              <a
                href="https://intents.near.org"
                target="_blank"
                rel="noopener"
              >
                <span className="who">NEAR Intents</span>intents.near.org, live
                product
              </a>
              <a href="https://near.ai" target="_blank" rel="noopener">
                <span className="who">NEAR AI</span>near.ai: AI Cloud &amp;
                IronClaw
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <footer className="closing">
        <div className="closing-inner">
          <div className="cl-t">
            <span className="dim">If you&apos;re long NEAR,</span>
            <br />
            nothing else comes close.
          </div>
          <p className="cl-sub">
            The yield covers your cost of capital while the thesis plays out.
            The structure gives you liquidity and collateral optionality
            throughout. The buy-and-burn compounds your position as protocol
            revenues grow. The re-rate is still ahead. The only question is
            sizing.
          </p>
          <a className="cl-mail" href="mailto:investors@cassets.xyz">
            investors@cassets.xyz
          </a>
          <div className="cl-legal">
            This is a point-in-time investment thesis prepared by cAssets
            Management Ltd, dated June 2026. cAssets Management Ltd is an
            independent company with no affiliation to the NEAR Foundation or
            NEAR Protocol. Intended for qualified non-US institutional
            investors only. Distributed in reliance on Regulation S under the
            U.S. Securities Act of 1933. Not an offer to sell or solicitation
            to buy any securities. All yield figures are targets only, not
            guaranteed. Data sourced from Dune Analytics, DefiLlama, NEAR
            Foundation, SVRN Research, Bitwise, Nansen, Messari, and CoinDesk
            as cited. Past performance is not indicative of future results.
            Investment in cNEAR involves significant risk including potential
            loss of principal. Issued by Assetize PCC (Jersey). Investment
            manager: cAssets Management Ltd (Jersey). US legal opinion: Mayer
            Brown LLP, 18 May 2026. JFSC regulated.
          </div>
        </div>
      </footer>
      {viewer && <FeedbackPanel doc="thesis" viewerEmail={viewer.email} />}
    </div>
  );
}
