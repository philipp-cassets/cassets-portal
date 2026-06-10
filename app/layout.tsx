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
// hairline borders. The portal has no dark variant, so both modes receive
// the same paper.
const stackThemeColors = {
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

const stackTheme = {
  light: stackThemeColors,
  dark: stackThemeColors,
  radius: "2px",
};

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
    <html lang="en">
      <body>
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
