import { DenominationToggle } from "@/components/DenominationToggle";

/** "Wed, 10 June" for the date pill, fixed locale, no client clock. */
function todayLabel(): string {
  const now = new Date();
  const wd = now.toLocaleDateString("en-GB", { weekday: "short" });
  const day = now.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  return `${wd}, ${day}`;
}

function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Sticky blurred header on the main canvas. Left: investor identity
 * (monogram avatar, sage pill, name). Right: the portal-wide denomination
 * toggle, the headline control of the page, plus a quiet date pill.
 * Server-rendered; only the toggle is a client island.
 */
export function PortalHeader({
  signedIn,
  displayName,
}: {
  signedIn: boolean;
  displayName: string | null;
}) {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <div className="topbar-id">
          {signedIn && displayName ? (
            <>
              <div className="avatar" aria-hidden="true">
                {monogram(displayName)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="topbar-line1">
                  <span>cAssets AMC · Jersey</span>
                  <span className="pill pill-xs">Signed in</span>
                </div>
                <div className="topbar-name">{displayName}</div>
              </div>
            </>
          ) : (
            <div>
              <div className="topbar-line1">cAssets AMC · Jersey</div>
              <div className="topbar-name">Investor Portal</div>
            </div>
          )}
        </div>
        <div className="topbar-right">
          <DenominationToggle />
          <span className="date-pill">{todayLabel()}</span>
          {!signedIn && (
            <a className="signin-link" href="/handler/sign-in">
              Investor sign in
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
