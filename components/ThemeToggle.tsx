"use client";

import { useEffect, useState } from "react";

// Versioned key: stale "dark" preferences stored under the old design's
// key must not apply to the rebuilt light-canonical portal.
const STORAGE_KEY = "cassets-theme-v2";

/**
 * Dependency-free light/dark toggle in the house voice: a quiet 11px caps
 * text button. Light is the canonical default; an explicit choice is
 * persisted to localStorage and applied as data-theme on <html> (the
 * pre-paint script in the layout restores it before first paint).
 */
export function ThemeToggle() {
  // null until mounted so the server and first client render agree.
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const explicit = document.documentElement.dataset.theme;
    setTheme(explicit === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode etc.; the choice simply will not persist.
    }
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? "☀ Light" : "☾ Dark"}
    </button>
  );
}
