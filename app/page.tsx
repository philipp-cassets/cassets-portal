import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalUser, getInvestorIdForAuthUser } from "@/lib/auth";
import { LandingReveal } from "./landing-reveal";
import { MobileNav } from "./landing-mobile-nav";
import { DashEmbed } from "./dash-embed";
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
  "cNEAR is an actively managed certificate that puts institutional discipline behind NEAR: institutional yield, independent custody, and on-chain transparency in one instrument.";

export const metadata: Metadata = {
  title: "cNEAR, NEAR, Professionally Managed",
  description: DESCRIPTION,
  // The landing is the one indexable surface; everything else inherits the
  // global noindex from the root layout.
  robots: { index: true, follow: true },
  openGraph: {
    title: "cNEAR, NEAR, Professionally Managed",
    description: DESCRIPTION,
    type: "website",
    siteName: "cNEAR",
    images: ["/landing/portal.png"],
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
  { pct: "20%", name: "Structured", flex: 20, dark: false },
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
            <span className="c">c</span>
            <span className="near">NEAR</span>
          </a>
          <div className="nav-links">
            <a href="#overview">OVERVIEW</a>
            <a href="#strategy">STRATEGY</a>
            <a href="#transparency">TRANSPARENCY</a>
            <a href="#contact">CONTACT</a>
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
            {/* Wired to the real auth flow: /portal redirects anonymous
                visitors to the Stack sign-in and lands investors in the
                portal, exactly the pre-landing behaviour. */}
            <a className="cta" href="/portal">
              <span className="ring">
                <span className="dot" />
              </span>
              Investor portal
            </a>
          </div>
          <MobileNav />
        </nav>

        <div className="hero-content">
          <p className="eyebrow">NEAR, Professionally Managed</p>
          <h1>
            <span className="line1">A New Standard</span>
            <span className="line2">in NEAR Asset Management</span>
          </h1>
          <p className="sub">
            cNEAR is an actively managed certificate that puts institutional
            discipline behind NEAR: institutional yield, independent custody,
            and on-chain transparency in one instrument.
          </p>

          {/* Mobile-only hero pieces from "cNEAR Mobile.html": the CTA moves
              from the nav into the hero, and the glyph clusters + dashboard
              collapse into one centered touch-reveal stage. All of this is
              display:none above the mobile breakpoint. */}
          <div className="m-ctas">
            <a className="m-cta" href="/portal">
              <span className="ring">
                <span className="dot" />
              </span>
              Investor portal
            </a>
          </div>
          <div className="m-stage" id="m-stage">
            <GlyphSet glyphs={MOBILE_GLYPHS} />
            <div className="overlay" aria-hidden="true">
              <GlyphSet glyphs={MOBILE_GLYPHS} />
            </div>
            <div className="m-dash">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/landing/portal.png"
                alt="cNEAR investor portal dashboard showing net asset value and NAV growth versus NEAR"
              />
            </div>
          </div>
          <div className="m-hint" aria-hidden="true">
            Touch the glass · Scroll to explore
          </div>
        </div>

        <Cluster side="left" glyphs={LEFT_GLYPHS} />

        <div className="dashwrap">
          <div className="dash">
            {/* Live demonstration portal (fixture data) instead of a static
                mock: the toggle, charts and screens actually work, and the
                hero stays in sync with every portal improvement. */}
            <DashEmbed />
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

      <section className="section" id="strategy">
        <div className="sec-eyebrow">Strategy</div>
        <h2 className="sec-h">
          Three yield engines, actively managed in one certificate.
        </h2>
        <p className="sec-sub">
          A tokenised certificate: the strategy is issued on-chain, and the
          portfolio allocates across staking, a multi-leg options program,
          and structured products, delta-managed to retain upside that
          single-leg covered calls give away.
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
              above holding NEAR, after 2%/20% fees with a 5% hurdle
            </div>
          </div>
          <div className="stat">
            <div className="stat-n">Monthly</div>
            <div className="stat-l">NAV-priced redemptions</div>
            <div className="stat-d">subscribe and redeem at published NAV</div>
          </div>
        </div>
      </section>

      <section className="section" id="transparency">
        <div className="sec-eyebrow">Transparency</div>
        <h2 className="sec-h">Nothing to take on faith.</h2>
        <p className="sec-sub">
          Every safeguard is structural: written into the issuing documents and
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
              trading records, with proof of reserves in the investor portal.
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

      <section className="section contact" id="contact">
        <div className="sec-eyebrow">Contact</div>
        <h2 className="sec-h">Speak with the team.</h2>
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
          Jersey. Not a collective investment fund.
        </div>
      </footer>

      <LandingReveal />
    </div>
  );
}
