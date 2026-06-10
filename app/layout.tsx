import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import { getOptionalUser } from "@/lib/auth";
import { isPreview } from "@/lib/preview";
import { Sidebar } from "@/components/Sidebar";
import { PortalHeader } from "@/components/PortalHeader";
import { Footer } from "@/components/Footer";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter-tight",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "cAssets · Investor Portal",
  description:
    "Investor portal for the cAssets AMC, Jersey. For investors only.",
};

// Every page is per-session; nothing is statically prerendered.
export const dynamic = "force-dynamic";

// Auth UI chrome themed to the Analitica language: warm paper, ink,
// sage-olive primary, hairline borders in light; the same voice on warm
// charcoal in dark. Both sets mirror the palettes in globals.css.
const stackLightColors = {
  background: "#f2f1ee",
  foreground: "#16140f",
  card: "#ffffff",
  cardForeground: "#16140f",
  popover: "#ffffff",
  popoverForeground: "#16140f",
  primary: "#3f4430",
  primaryForeground: "#f2f1ee",
  secondary: "#e4e2db",
  secondaryForeground: "#16140f",
  muted: "#e4e2db",
  mutedForeground: "#73706a",
  accent: "#e0e1d3",
  accentForeground: "#3f4430",
  destructive: "#9c4a33",
  destructiveForeground: "#f2f1ee",
  border: "#e0ded7",
  input: "#e0ded7",
  ring: "#3f4430",
};

const stackDarkColors = {
  background: "#191713",
  foreground: "#eae6dc",
  card: "#211e18",
  cardForeground: "#eae6dc",
  popover: "#211e18",
  popoverForeground: "#eae6dc",
  primary: "#c9cea9",
  primaryForeground: "#191713",
  secondary: "#2b2823",
  secondaryForeground: "#eae6dc",
  muted: "#2b2823",
  mutedForeground: "#979388",
  accent: "#34372a",
  accentForeground: "#c9cea9",
  destructive: "#c97e66",
  destructiveForeground: "#191713",
  border: "#2e2b25",
  input: "#2e2b25",
  ring: "#c9cea9",
};

const stackTheme = {
  light: stackLightColors,
  dark: stackDarkColors,
  radius: "12px",
};

// Restores the persisted theme and denomination choices before first paint
// so there is no flash. Runs as the first node in <body>. The key is
// versioned (cassets-theme-v2) so stale "dark" preferences from the old
// design do not apply; absent or invalid storage means light, the
// canonical default, and the USD default denomination.
const themeInitScript = `try{var t=localStorage.getItem("cassets-theme-v2");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t;var d=localStorage.getItem("cassets-denom");if(d==="USD"||d==="NEAR")document.documentElement.dataset.denom=d}catch(e){}`;

// PREVIEW-ONLY: lets the screenshot loop verify dark mode via ?theme=dark.
// Appended to the init script only when PORTAL_PREVIEW=1, never in a
// deployed environment.
const previewThemeScript = `try{var q=new URLSearchParams(location.search).get("theme");if(q==="dark"||q==="light")document.documentElement.dataset.theme=q}catch(e){}`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Shell chrome only: resolve the signed-in user (if any).
  // Failures here must never take the whole shell down.
  let signedIn = false;
  let displayName: string | null = null;
  try {
    const user = await getOptionalUser();
    if (user) {
      signedIn = true;
      displayName = user.displayName;
    }
  } catch {
    // Render the shell regardless; pages enforce their own guards.
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={interTight.variable}>
        <script
          dangerouslySetInnerHTML={{
            __html: isPreview()
              ? themeInitScript + previewThemeScript
              : themeInitScript,
          }}
        />
        <StackProvider app={stackServerApp}>
          <StackTheme theme={stackTheme}>
            <div className="shell">
              <Sidebar signedIn={signedIn} displayName={displayName} />
              <div className="canvas">
                <PortalHeader signedIn={signedIn} displayName={displayName} />
                <main className="container">{children}</main>
                <Footer />
              </div>
            </div>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
