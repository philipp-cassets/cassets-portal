"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * The signature surface: a full-height smoky taupe glass panel with white
 * text. Wordmark chip on top, nav in the middle, investor services, session,
 * theme toggle and sign out pinned to the bottom. Collapsible to 72px on
 * desktop; on small screens it becomes a top bar (pure CSS).
 *
 * Client component only for usePathname and the collapse state; it receives
 * already-resolved session data and performs no queries.
 */

const ICONS: Record<string, React.ReactNode> = {
  "/": (
    // dashboard grid
    <svg viewBox="0 0 18 18" fill="none" strokeWidth="1.3" aria-hidden="true">
      <rect x="2" y="2" width="6" height="6" rx="1.5" />
      <rect x="10" y="2" width="6" height="6" rx="1.5" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" />
    </svg>
  ),
  "/activity": (
    // opposing arrows: subscriptions and redemptions
    <svg viewBox="0 0 18 18" fill="none" strokeWidth="1.3" aria-hidden="true">
      <path d="M5 3v9M5 12l-2.5-2.5M5 12l2.5-2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 15V6M13 6l-2.5 2.5M13 6l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/documents": (
    // filed sheet
    <svg viewBox="0 0 18 18" fill="none" strokeWidth="1.3" aria-hidden="true">
      <path d="M4.5 2h6L14 5.5V16h-9.5V2z" strokeLinejoin="round" />
      <path d="M10.5 2v3.5H14" strokeLinejoin="round" />
      <path d="M7 9.5h4.5M7 12h4.5" strokeLinecap="round" />
    </svg>
  ),
  "/news": (
    // bulletin
    <svg viewBox="0 0 18 18" fill="none" strokeWidth="1.3" aria-hidden="true">
      <rect x="2.5" y="3.5" width="13" height="11" rx="1.5" />
      <path d="M5.5 7h7M5.5 9.5h7M5.5 12h4" strokeLinecap="round" />
    </svg>
  ),
  "/transparency": (
    // proof seal
    <svg viewBox="0 0 18 18" fill="none" strokeWidth="1.3" aria-hidden="true">
      <path d="M9 2l5.5 2.5v4.2c0 3.4-2.3 5.7-5.5 7.3-3.2-1.6-5.5-3.9-5.5-7.3V4.5L9 2z" strokeLinejoin="round" />
      <path d="M6.6 9l1.7 1.7L11.6 7.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function Sidebar({
  signedIn,
  displayName,
}: {
  signedIn: boolean;
  displayName: string | null;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const links = signedIn
    ? [
        { href: "/", label: "Dashboard" },
        { href: "/activity", label: "Activity" },
        { href: "/documents", label: "Documents" },
        { href: "/news", label: "News & Reports" },
        { href: "/transparency", label: "Transparency" },
      ]
    : [{ href: "/transparency", label: "Transparency" }];

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    // The canvas margin responds via a body attribute so the whole shell
    // stays in pure CSS.
    if (next) document.body.dataset.sidebar = "collapsed";
    else delete document.body.dataset.sidebar;
  }

  return (
    <aside className="sidebar">
      <div className="side-top">
        <span className="logo-chip" aria-hidden="true">
          <span className="lc-c">c</span>
          <span className="lc-rest">A</span>
        </span>
        <Link href="/" className="side-word" style={{ textDecoration: "none" }}>
          <div className="ww">
            <span className="wm-c">c</span>Assets
          </div>
          <div className="ws">Investor Portal</div>
        </Link>
        <button
          type="button"
          className="side-collapse"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            style={{
              transform: collapsed ? "rotate(180deg)" : undefined,
              transition: "transform 0.25s ease",
            }}
            aria-hidden="true"
          >
            <path d="M9.5 3.5L5 8l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="side-search" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L14 14" strokeLinecap="round" />
        </svg>
        <span className="ss-ph">Searching</span>
        <span className="ss-kbd">ctrl + F</span>
      </div>

      <nav className="side-nav">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "current" : undefined}
            title={l.label}
          >
            {ICONS[l.href]}
            <span className="side-label">{l.label}</span>
          </Link>
        ))}
      </nav>

      <div className="side-bottom">
        <div className="side-services">Investor services</div>
        {signedIn && displayName && (
          <div className="side-session" title={displayName}>
            {displayName}
          </div>
        )}
        <div className="side-actions">
          {signedIn ? (
            <a href="/handler/sign-out">Sign out</a>
          ) : (
            <a href="/handler/sign-in">Sign in</a>
          )}
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
