"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Site header in the report style: wordmark and session line on the
 * masthead, letterspaced caps navigation below with the current page
 * underlined in forest. Client component only for usePathname; it receives
 * already-resolved session data and performs no queries.
 */
export function Header({
  signedIn,
  displayName,
}: {
  signedIn: boolean;
  displayName: string | null;
}) {
  const pathname = usePathname();

  const links = signedIn
    ? [
        { href: "/", label: "Position" },
        { href: "/activity", label: "Activity" },
        { href: "/documents", label: "Documents" },
        { href: "/news", label: "News" },
        { href: "/transparency", label: "Transparency" },
      ]
    : [{ href: "/transparency", label: "Transparency" }];

  return (
    <header className="site-header">
      <div className="container">
        <div className="masthead">
          <Link href="/" className="wordmark">
            <span className="wm-c">c</span>
            <span className="wm-rest">Assets</span>
          </Link>
          <div className="session">
            {signedIn ? (
              <>
                {displayName && <b>{displayName}</b>}
                <a href="/handler/sign-out">Sign out</a>
              </>
            ) : (
              <a href="/handler/sign-in">Investor sign in</a>
            )}
            <ThemeToggle />
          </div>
        </div>
        <nav className="site-nav">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href ? "current" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
