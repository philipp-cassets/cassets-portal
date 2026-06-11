import type { Metadata } from "next";
import { Inter_Tight, IBM_Plex_Mono } from "next/font/google";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter-tight",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Helvetica Neue", "Arial", "sans-serif"],
});

// IBM Plex Mono: code-like artifacts only (refs, filenames).
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

/**
 * Minimal root layout: fonts + document shell only. The investor-portal
 * chrome (sidebar, header, Stack provider, globals.css) lives in the
 * (portal) route-group layout; the public landing at / brings its own
 * route-scoped stylesheet.
 *
 * robots: noindex is the global default so every authed/portal surface
 * stays out of search engines; the public landing page overrides it with
 * an explicit index,follow in its own metadata.
 */
export const metadata: Metadata = {
  title: "cNEAR · Investor Portal",
  description:
    "Investor portal for the cAssets AMC, Jersey. For investors only.",
  robots: { index: false, follow: false },
};

// Every page is per-session; nothing is statically prerendered.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${interTight.className} ${interTight.variable} ${plexMono.variable}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
