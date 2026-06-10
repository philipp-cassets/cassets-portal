import Link from "next/link";

/**
 * Site header. Server component: receives already-resolved data, performs no
 * queries itself. `cells` are the cells the signed-in investor holds.
 */
export function Header({
  signedIn,
  cells,
}: {
  signedIn: boolean;
  cells: string[];
}) {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="brand">
          <span className="crest" aria-hidden="true">
            <span className="crest-inner">cA</span>
          </span>
          <span className="wordmark">
            <span className="wm-c">c</span>Assets
          </span>
        </Link>
        {cells.length > 0 && (
          <div className="cell-badges">
            {cells.map((cell) => (
              <span key={cell} className="cell-badge">
                {cell}
              </span>
            ))}
          </div>
        )}
        <nav className="site-nav">
          {signedIn ? (
            <>
              <Link href="/">Position</Link>
              <Link href="/activity">Activity</Link>
              <Link href="/documents">Documents</Link>
              <Link href="/news">News</Link>
              <Link href="/transparency">Transparency</Link>
              <a href="/handler/sign-out" className="signout">
                Sign out
              </a>
            </>
          ) : (
            <>
              <Link href="/transparency">Transparency</Link>
              <a href="/handler/sign-in" className="signout">
                Investor sign in
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
