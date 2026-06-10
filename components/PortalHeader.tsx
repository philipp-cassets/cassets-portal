import { DenominationToggle } from "@/components/DenominationToggle";
import { IcoBell, IcoChevron } from "@/components/icons";

/** "Jun 1 – Jun 10, 2026": the current statement period, month-to-date. */
function periodLabel(): string {
  const now = new Date();
  const mon = now.toLocaleDateString("en-US", { month: "short" });
  const year = now.getFullYear();
  return `${mon} 1 – ${mon} ${now.getDate()}, ${year}`;
}

/** "Wed, 10 June" for the notification pill. */
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
 * Portal header on the canvas, per the handoff: greige avatar circle,
 * investor code line with a flat pill, name at 21px/600; on the right the
 * USD/NEAR denomination toggle, a white date pill and a white notification
 * pill with sage unread dot and dark count chip.
 */
export function PortalHeader({
  signedIn,
  displayName,
  activated,
  notifCount,
}: {
  signedIn: boolean;
  displayName: string | null;
  activated: boolean;
  notifCount: number;
}) {
  return (
    <header className="header">
      <div className="hl">
        {signedIn && displayName ? (
          <>
            <div className="avatar" aria-hidden="true">
              {monogram(displayName)}
            </div>
            <div>
              <div className="l1">
                <span className="code">cAssets AMC · Jersey</span>
                <span className="pill-flat">
                  {activated ? "VERIFIED" : "PENDING"}
                </span>
              </div>
              <div className="l2">{displayName}</div>
            </div>
          </>
        ) : (
          <div>
            <div className="l1">
              <span className="code">cAssets AMC · Jersey</span>
            </div>
            <div className="l2">Investor Portal</div>
          </div>
        )}
      </div>

      <div className="hr">
        <DenominationToggle />

        <div className="card-pill date">
          <span>{periodLabel()}</span>
          <IcoChevron size={14} />
        </div>

        {signedIn ? (
          <div className="card-pill notif">
            <span className="bell-wrap">
              <IcoBell size={18} />
              {notifCount > 0 && <span className="bell-dot" />}
            </span>
            <span>{todayLabel()}</span>
            {notifCount > 0 && (
              <span className="notif-badge tnum">{notifCount}</span>
            )}
          </div>
        ) : (
          <a className="signin-link" href="/handler/sign-in">
            Investor sign in
          </a>
        )}
      </div>
    </header>
  );
}
