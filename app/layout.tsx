import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import { getOptionalUser } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "cAssets · Investor Portal",
  description:
    "Investor portal for the cAssets AMC, Jersey. For investors only.",
};

// Every page is per-session; nothing is statically prerendered.
export const dynamic = "force-dynamic";

// Auth UI chrome themed to the house style: warm paper, forest primary,
// hairline borders in light; the same voice on ink in dark. Both sets
// mirror the palettes in globals.css.
const stackLightColors = {
  background: "#f5f2ea",
  foreground: "#14161a",
  card: "#f5f2ea",
  cardForeground: "#14161a",
  popover: "#f5f2ea",
  popoverForeground: "#14161a",
  primary: "#1f3d2b",
  primaryForeground: "#f5f2ea",
  secondary: "#dbd6c8",
  secondaryForeground: "#14161a",
  muted: "#dbd6c8",
  mutedForeground: "#6f6b62",
  accent: "#dbd6c8",
  accentForeground: "#14161a",
  destructive: "#6e1d24",
  destructiveForeground: "#f5f2ea",
  border: "#dbd6c8",
  input: "#dbd6c8",
  ring: "#1f3d2b",
};

const stackDarkColors = {
  background: "#14161a",
  foreground: "#ede9dd",
  card: "#1b1e24",
  cardForeground: "#ede9dd",
  popover: "#1b1e24",
  popoverForeground: "#ede9dd",
  primary: "#4f8364",
  primaryForeground: "#14161a",
  secondary: "#2e3138",
  secondaryForeground: "#ede9dd",
  muted: "#2e3138",
  mutedForeground: "#8b867a",
  accent: "#2e3138",
  accentForeground: "#ede9dd",
  destructive: "#b0524a",
  destructiveForeground: "#14161a",
  border: "#2e3138",
  input: "#2e3138",
  ring: "#4f8364",
};

const stackTheme = {
  light: stackLightColors,
  dark: stackDarkColors,
  radius: "2px",
};

// Restores a persisted theme choice before first paint so there is no
// flash. Runs as the first node in <body>; absent or invalid storage means
// no data-theme, which lets prefers-color-scheme decide via globals.css.
const themeInitScript = `try{var t=localStorage.getItem("cassets-theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Header chrome only: resolve the signed-in user (if any).
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
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <StackProvider app={stackServerApp}>
          <StackTheme theme={stackTheme}>
            <div className="shell">
              <Header signedIn={signedIn} displayName={displayName} />
              <main className="container">{children}</main>
              <Footer />
            </div>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
