import type { Metadata } from "next";
import { Fragment } from "react";
import { redirect } from "next/navigation";
import { getOptionalUser, getInvestorIdForAuthUser } from "@/lib/auth";
import { LandingReveal } from "./landing-reveal";
import { MobileNav } from "./landing-mobile-nav";
import "./landing.css";

/**
 * Public marketing landing for cNEAR, recreated pixel-faithfully from the
 * design handoff "cNEAR Landing - Glass Light.html". Static content only:
 * no investor data is queried or rendered here.
 *
 * Routing preserved from the old root page:
 *   anonymous            -> this landing (no redirect)
 *   signed in, activated -> /portal
 *   signed in, pending   -> /pending (PendingActivation inside the shell)
 */
const DESCRIPTION =
  "NEAR is the money of the AI economy, and cNEAR is built to compound it. Your NEAR is put to work through staking, options and structured products, under independent custody, with the value published on-chain every month.";

export const metadata: Metadata = {
  title: "cNEAR, Compound Your NEAR",
  description: DESCRIPTION,
  // The landing is the one indexable surface; everything else inherits the
  // global noindex from the root layout.
  robots: { index: true, follow: true },
  openGraph: {
    title: "cNEAR, Compound Your NEAR",
    description: DESCRIPTION,
    type: "website",
    siteName: "cNEAR",
  },
};

type Glyph = {
  w: number;
  h: number;
  left: number;
  bottom: number;
  z: number;
  rot: number;
  float?: boolean;
};

const LEFT_GLYPHS: Glyph[] = [
  { w: 560, h: 560, left: -150, bottom: -84, z: 2, rot: -9 },
  { w: 350, h: 350, left: 296, bottom: -38, z: 3, rot: 10 },
];

const RIGHT_GLYPHS: Glyph[] = [
  { w: 640, h: 640, left: 180, bottom: -130, z: 2, rot: 14 },
  { w: 220, h: 220, left: 340, bottom: 290, z: 1, rot: -12, float: true },
];

// Mobile hero composition from "cNEAR Mobile.html": two glyphs tucked behind
// a centered portal screenshot inside a 250px stage. Only rendered below the
// mobile breakpoint (the desktop clusters hide there, and vice versa).
const MOBILE_GLYPHS: Glyph[] = [
  { w: 240, h: 240, left: -90, bottom: -40, z: 1, rot: -9 },
  { w: 150, h: 150, left: 290, bottom: -20, z: 1, rot: 12 },
];

function GlyphSet({ glyphs }: { glyphs: Glyph[] }) {
  return (
    <>
      {glyphs.map((g, i) => (
        <div
          key={i}
          className={g.float ? "nglyph-wrap nglyph-float" : "nglyph-wrap"}
          style={{
            width: g.w,
            height: g.h,
            left: g.left,
            bottom: g.bottom,
            zIndex: g.z,
            transform: `rotate(${g.rot}deg)`,
          }}
        >
          <div className="nglyph" />
        </div>
      ))}
    </>
  );
}

function Cluster({
  side,
  glyphs,
}: {
  side: "left" | "right";
  glyphs: Glyph[];
}) {
  return (
    <div
      className={`cluster cluster-${side}`}
      id={`cluster-${side}`}
      aria-hidden="true"
    >
      <div className="cluster-inner">
        <div className="ground-shadow" />
        <GlyphSet glyphs={glyphs} />
        <div className="overlay">
          <GlyphSet glyphs={glyphs} />
        </div>
      </div>
    </div>
  );
}

const ALLOC_SEGMENTS = [
  { pct: "20%", name: "Staking", flex: 20, dark: false },
  { pct: "60%", name: "Options", flex: 60, dark: true },
  { pct: "20%", name: "Structured products", flex: 20, dark: false },
];

function AllocSegments() {
  return (
    <>
      {ALLOC_SEGMENTS.map((s) => (
        <div
          key={s.name}
          className={s.dark ? "alloc-seg options" : "alloc-seg"}
          style={{ flex: s.flex }}
        >
          <div className="alloc-pct">{s.pct}</div>
          <div className="alloc-name">{s.name}</div>
        </div>
      ))}
    </>
  );
}

const GET_ROUTES = [
  {
    logo: "/landing/logo-near.png",
    brand: "near.com",
    audience: "retail",
    title: "Get it on near.com",
    body: "Buy and sell cNEAR from your NEAR account in a few taps. No paperwork on your side.",
    cta: "Open near.com",
    href: "https://near.com",
  },
  {
    logo: "/landing/logo-rhea.png",
    brand: "Rhea",
    audience: "retail",
    title: "Trade on Rhea DEX",
    body: "Swap in and out of cNEAR on-chain any time, straight from your wallet.",
    cta: "Open Rhea",
    href: "https://app.rhea.finance",
  },
  {
    logo: "/landing/logo-cassets.png",
    brand: "cAssets",
    audience: "institutional",
    title: "Subscribe directly",
    body: "Subscribe and redeem at published NAV through the issuer, with monthly dealing.",
    cta: "Request subscription",
    href: "mailto:investors@cassets.xyz?subject=cNEAR%20direct%20subscription",
  },
];

const AUDIENCES: Record<string, { label: string; note: string }> = {
  retail: {
    label: "Retail",
    note: "Buy and sell any time on the secondary market.",
  },
  institutional: {
    label: "Institutions",
    note: "Subscribe and redeem directly with the issuer at published NAV.",
  },
};

function GetRoutes() {
  return (
    <>
      {GET_ROUTES.map((r, i) => (
        <Fragment key={r.brand}>
          {(i === 0 || GET_ROUTES[i - 1].audience !== r.audience) && (
            <div className="get-group">
              <span className="get-group-l">{AUDIENCES[r.audience].label}</span>
              <span className="get-group-n">{AUDIENCES[r.audience].note}</span>
            </div>
          )}
        <a
          className="get-row"
          href={r.href}
          {...(r.href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="get-logo" src={r.logo} alt={r.brand} />
          <span className="get-txt">
            <span className="get-t">{r.title}</span>
            <span className="get-b">{r.body}</span>
          </span>
          <span className="get-go">{r.cta} <span aria-hidden="true">→</span></span>
        </a>
        </Fragment>
      ))}
    </>
  );
}

// Logos are dropped in as /landing/partners/<file>; a partner without a file
// renders as a typeset name until its artwork is added.
const PARTNERS: Array<{ name: string; logo?: string }> = [
  { name: "Sygnum" },
  { name: "Keyrock" },
  { name: "STS Digital" },
  { name: "DV Trading", logo: "/landing/partners/dv-trading.svg" },
  { name: "Cumberland", logo: "/landing/partners/cumberland.svg" },
  { name: "B2C2", logo: "/landing/partners/b2c2.svg" },
];

const FAQ = [
  ["Who issues cNEAR?", "cNEAR is issued by Assetize PCC in Jersey. It is an actively managed certificate, not a collective investment fund."],
  ["Where is my NEAR held?", "With an independent custodian, segregated from the manager."],
  ["How do I know what it is worth?", "NAV is published on-chain every month, and certificate holders also receive risk reports and trading records."],
  ["Can I get out?", "Yes. Retail holders can sell any time on the secondary market, on near.com or Rhea. Institutions can also redeem directly with the issuer, monthly at the published NAV."],
  ["Who keeps the manager honest?", "An independent oversight committee can hire and fire the manager and holds a veto on material strategy changes."],
  ["Which route should I pick?", "Retail: start on near.com, or use Rhea if you prefer to swap on-chain from your own wallet. Institutions: subscribe directly with the issuer, which also gives you NAV-priced dealing for larger tickets."],
];

export default async function Home() {
  let state: "anon" | "pending" | "active" = "anon";
  try {
    const user = await getOptionalUser();
    if (user) {
      const investorId = await getInvestorIdForAuthUser(user.authUserId);
      state = investorId ? "active" : "pending";
    }
  } catch {
    // Auth/database hiccups must never take the public page down.
  }
  if (state === "active") redirect("/portal");
  if (state === "pending") redirect("/pending");

  return (
    <div className="landing" id="landing">
      <section className="hero" id="overview">
        <div className="hero-halo" />

        <nav className="nav" aria-label="Main">
          <a className="logo" href="#overview">
            <span className="logo-mark" aria-hidden="true" />
            <span className="c">c</span>
            <span className="near">NEAR</span>
          </a>
          <div className="nav-links">
            <a href="#overview">OVERVIEW</a>
            <a href="#story">THE IDEA</a>
            <a href="#strategy">HOW IT WORKS</a>
            <a href="#transparency">SAFEGUARDS</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-right">
            <div className="lang">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <span>English</span>
            </div>
            <a className="cta" href="#overview">
              <span className="ring">
                <span className="dot" />
              </span>
              Get cNEAR
            </a>
          </div>
          <MobileNav />
        </nav>

        <div className="hero-content">
          <p className="eyebrow">cNEAR, Compound Your NEAR</p>
          <h1>
            <span className="line1">Hold the money of AI.</span>
            <span className="line2">Let it compound.</span>
          </h1>
          <p className="sub">
            NEAR is the money of the AI economy. cNEAR compounds it: your NEAR
            is put to work through staking, options and structured products,
            so the amount you own keeps growing. Professionally managed,
            independently held, published on-chain.
          </p>

          {/* Mobile-only hero pieces from "cNEAR Mobile.html": the CTA moves
              from the nav into the hero, and the glyph clusters + dashboard
              collapse into one centered touch-reveal stage. All of this is
              display:none above the mobile breakpoint. */}
          <div className="m-ctas">
            <a className="m-cta" href="#get">
              <span className="ring">
                <span className="dot" />
              </span>
              Get cNEAR
            </a>
          </div>
          <div className="m-stage" id="m-stage">
            <GlyphSet glyphs={MOBILE_GLYPHS} />
            <div className="overlay" aria-hidden="true">
              <GlyphSet glyphs={MOBILE_GLYPHS} />
            </div>
          </div>
          <div className="m-hint" aria-hidden="true">
            Touch the glass · Scroll for the full story
          </div>
        </div>

        <Cluster side="left" glyphs={LEFT_GLYPHS} />

        <div className="dashwrap">
          <div className="getcard" id="get-hero">
            <div className="get-head">
              <span className="get-eyebrow">How to get cNEAR</span>
              <span className="get-sub">Retail and institutional routes</span>
            </div>
            <GetRoutes />
          </div>
        </div>

        <Cluster side="right" glyphs={RIGHT_GLYPHS} />

        <div className="scroll-ind" aria-hidden="true">
          <div className="bob">
            <svg viewBox="0 0 24 24">
              <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
            </svg>
            <span>Scroll to explore</span>
          </div>
        </div>
      </section>

      <section className="section get-mobile" id="get">
        <div className="sec-eyebrow">Get cNEAR</div>
        <h2 className="sec-h">Two ways in. Pick the one that fits.</h2>
        <div className="get-list">
          <GetRoutes />
        </div>
      </section>

      <section className="section" id="story">
        <div className="sec-eyebrow">The idea</div>
        <h2 className="sec-h">
          Holding NEAR is a bet on AI money. cNEAR is built to compound it.
        </h2>
        <p className="sec-sub">
          NEAR is the money of the AI economy: the asset agents and AI
          applications settle in. Holding it in a wallet gives you the same
          number of tokens next year as today. cNEAR is designed to change
          that: you stay fully invested in AI money while a professional
          manager works the position to earn more NEAR, and that compounds.
        </p>
        <div className="tr-grid story-grid">
          <div className="tr-card">
            <div className="tr-num">01</div>
            <h3 className="tr-t">You bring NEAR</h3>
            <p className="tr-b">
              Subscribe or buy cNEAR. Your exposure stays in NEAR, so you keep
              the upside of the asset you already believe in.
            </p>
          </div>
          <div className="tr-card">
            <div className="tr-num">02</div>
            <h3 className="tr-t">cNEAR puts it to work</h3>
            <p className="tr-b">
              The portfolio is spread across staking, a multi-leg options
              program and structured products, all in NEAR, all actively
              managed.
            </p>
          </div>
          <div className="tr-card">
            <div className="tr-num">03</div>
            <h3 className="tr-t">The yield stays in the certificate</h3>
            <p className="tr-b">
              Income earned is added to the portfolio, so each cNEAR is backed
              by more NEAR over time. That is how your NEAR compounds.
            </p>
          </div>
          <div className="tr-card">
            <div className="tr-num">04</div>
            <h3 className="tr-t">You can see it and exit it</h3>
            <p className="tr-b">
              Redeem any time on the secondary market. NAV is published
              on-chain every month, and institutions can also redeem directly
              at that published NAV.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="strategy">
        <div className="sec-eyebrow">Strategy</div>
        <h2 className="sec-h">
          Three ways your NEAR earns, managed as one portfolio.
        </h2>
        <p className="sec-sub">
          Staking earns steady network rewards. The options program earns
          premium by selling upside in a disciplined, delta-managed way, so
          more of the upside is kept than with single-leg covered calls.
          Structured products add defined-outcome return on top. Together
          they aim to out-earn simply holding NEAR.
        </p>
        <div className="alloc" id="alloc">
          <AllocSegments />
          <div className="alloc-overlay overlay" aria-hidden="true">
            <AllocSegments />
          </div>
        </div>
        <div className="stat-row">
          <div className="stat">
            <div className="stat-n">~12.6%</div>
            <div className="stat-l">Net to certificate holder</div>
            <div className="stat-d">
              target, versus holding NEAR alone
            </div>
          </div>
          <div className="stat">
            <div className="stat-n">Any time</div>
            <div className="stat-l">Secondary-market liquidity</div>
            <div className="stat-d">
              retail buys and sells on near.com or Rhea; institutions subscribe
              and redeem monthly at published NAV
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="transparency">
        <div className="sec-eyebrow">Transparency</div>
        <h2 className="sec-h">Your NEAR stays safe and visible.</h2>
        <p className="sec-sub">
          Compounding your NEAR only matters if it is protected. Every safeguard is structural: written into the issuing documents and
          visible on-chain, not promised in a pitch.
        </p>
        <div className="tr-grid">
          <div className="tr-card">
            <div className="tr-num">01</div>
            <h3 className="tr-t">Monthly on-chain NAV</h3>
            <p className="tr-b">
              NAV is published on-chain every month, making portfolio risk
              transparent in real time, so strategy drift cannot be concealed.
            </p>
          </div>
          <div className="tr-card">
            <div className="tr-num">02</div>
            <h3 className="tr-t">Independent custody</h3>
            <p className="tr-b">
              Assets sit with an independent custodian, segregated from the
              manager. Issued by Assetize PCC in Jersey.
            </p>
          </div>
          <div className="tr-card">
            <div className="tr-num">03</div>
            <h3 className="tr-t">Full information rights</h3>
            <p className="tr-b">
              Certificate holders receive monthly NAV, risk reports, and
              trading records, with proof of reserves.
            </p>
          </div>
          <div className="tr-card">
            <div className="tr-num">04</div>
            <h3 className="tr-t">Independent oversight</h3>
            <p className="tr-b">
              An independent oversight committee holds effective hire-and-fire
              authority over the manager, with a veto on material strategy
              changes written into the IMA.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="partners">
        <div className="sec-eyebrow">Partners</div>
        <h2 className="sec-h">Trusted institutional partners.</h2>
        <p className="sec-sub">
          cNEAR works with established custody, market-making and trading
          institutions.
        </p>
        <div className="partner-row">
          {PARTNERS.map((p) => (
            <div className="partner" key={p.name}>
              {p.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logo} alt={p.name} />
              ) : (
                <span className="partner-name">{p.name}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="faq">
        <div className="sec-eyebrow">Good to know</div>
        <h2 className="sec-h">The questions people ask first.</h2>
        <div className="tr-grid">
          {FAQ.map(([q, a]) => (
            <div className="tr-card" key={q}>
              <h3 className="tr-t">{q}</h3>
              <p className="tr-b">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section contact" id="contact">
        <div className="sec-eyebrow">Contact</div>
        <h2 className="sec-h">Questions? Speak with the team.</h2>
        <a className="contact-mail" href="mailto:investors@cassets.xyz">
          investors@cassets.xyz
        </a>
      </section>

      <footer className="footer">
        <div className="mark">
          <span className="c">c</span>
          <span className="near">NEAR</span>
        </div>
        <div className="fine">
          cNEAR is an actively managed certificate issued by Assetize PCC,
          Jersey. Not a collective investment fund. The value of cNEAR and the income from it can go down as well as up, and past or target returns are not a guarantee.
        </div>
      </footer>

      <LandingReveal />
    </div>
  );
}
