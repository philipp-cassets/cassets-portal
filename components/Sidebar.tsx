"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IcoPanel,
  IcoSearch,
  IcoGrid,
  IcoArrows,
  IcoPie,
  IcoFile,
  IcoMegaphone,
  IcoShield,
} from "@/components/icons";

/**
 * The signature surface, per the handoff: a 408px greige gradient card
 * inset 12px from the viewport edge, 26px radius, film-grain overlay.
 * White logo circle, search inset, 48px nav rows. Collapses to 76px over
 * 350ms var(--ease); labels fade 120ms first and are then display:none so
 * icons re-center (opacity-only hiding pushes them off-center).
 *
 * Client component only for usePathname and the collapse state; it receives
 * already-resolved session data and performs no queries.
 */

type NavLink = {
  href: string;
  label: string;
  icon: (p: { size?: number }) => React.ReactNode;
};

const AUTHED_LINKS: NavLink[] = [
  { href: "/", label: "Dashboard", icon: IcoGrid },
  { href: "/activity", label: "Activity", icon: IcoArrows },
  { href: "/distributions", label: "Distributions", icon: IcoPie },
  { href: "/documents", label: "Documents", icon: IcoFile },
  { href: "/news", label: "News & Reports", icon: IcoMegaphone },
  { href: "/transparency", label: "Transparency", icon: IcoShield },
];

const PUBLIC_LINKS: NavLink[] = [
  { href: "/transparency", label: "Transparency", icon: IcoShield },
];

export function Sidebar({
  signedIn,
  displayName,
}: {
  signedIn: boolean;
  displayName: string | null;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const links = signedIn ? AUTHED_LINKS : PUBLIC_LINKS;

  return (
    <aside className={"sidebar" + (collapsed ? " collapsed" : "")}>
      <div className="sb-top">
        <div className="sb-logo" aria-label="cNEAR">
          <span>c</span>
          <b>NEAR</b>
        </div>
        <div className="sb-id sb-fade">
          <div className="t1">cAssets</div>
          <div className="t2">cNEAR Investor Portal</div>
        </div>
        <button
          type="button"
          className="sb-collapse"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <IcoPanel size={17} />
        </button>
      </div>
      <div className="sb-hair" />

      <div className="sb-search">
        <span className="chip">
          <IcoSearch size={13} />
        </span>
        <input
          className="sb-fade"
          type="text"
          placeholder="Searching"
          aria-label="Search"
        />
        <span className="hint sb-fade">ctrl + F</span>
      </div>

      <nav className="nav">
        {links.map((l) => {
          const ItemIcon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={"nav-item" + (pathname === l.href ? " on" : "")}
              title={l.label}
            >
              <span className="ico">
                <ItemIcon size={18} />
              </span>
              <span className="lbl sb-fade">{l.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sb-foot">
        {signedIn && displayName && (
          <div className="who" title={displayName}>
            {displayName}
          </div>
        )}
        {signedIn ? (
          <a href="/handler/sign-out">Sign out</a>
        ) : (
          <a href="/handler/sign-in">Sign in</a>
        )}
      </div>
    </aside>
  );
}
