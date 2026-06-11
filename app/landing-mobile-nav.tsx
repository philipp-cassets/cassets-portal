"use client";

import { useState } from "react";

/**
 * Mobile nav per the design handoff "cNEAR Mobile.html": below the mobile
 * breakpoint the desktop nav links / language / CTA give way to a burger
 * button. The prototype leaves the burger inert (no menu screen was drawn),
 * so the open state here is the minimal functional reading: the existing
 * section links plus the Investor portal CTA in a panel under the nav bar,
 * styled with the same tokens. Renders nothing on desktop (CSS-hidden).
 */
const LINKS: Array<[string, string]> = [
  ["#overview", "OVERVIEW"],
  ["#strategy", "STRATEGY"],
  ["#transparency", "TRANSPARENCY"],
  ["#contact", "CONTACT"],
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="m-burger"
        aria-label={open ? "Close menu" : "Menu"}
        aria-expanded={open}
        aria-controls="m-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <div className="m-menu" id="m-menu">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <a className="m-cta" href="/portal" onClick={() => setOpen(false)}>
            <span className="ring">
              <span className="dot" />
            </span>
            Investor portal
          </a>
        </div>
      )}
    </>
  );
}
