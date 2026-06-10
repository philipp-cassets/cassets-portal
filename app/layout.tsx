import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import { getOptionalUser, getInvestorIdForAuthUser } from "@/lib/auth";
import { getPositions } from "@/lib/data";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "cAssets — Investor Portal",
  description:
    "Investor portal for the cAssets AMC, Jersey. For investors only.",
};

// Every page is per-session; nothing is statically prerendered.
export const dynamic = "force-dynamic";

// Auth UI chrome themed to the house style: ivory paper, oxblood accent.
// The portal has no dark variant, so both modes receive the same paper.
const stackThemeColors = {
  background: "#f6f1e7",
  foreground: "#1c2230",
  card: "#fcf9f2",
  cardForeground: "#1c2230",
  popover: "#fcf9f2",
  popoverForeground: "#1c2230",
  primary: "#6e1d24",
  primaryForeground: "#fcf9f2",
  secondary: "#dcd3bf",
  secondaryForeground: "#1c2230",
  muted: "#dcd3bf",
  mutedForeground: "#6b6557",
  accent: "#dcd3bf",
  accentForeground: "#1c2230",
  destructive: "#8c2b1e",
  destructiveForeground: "#fcf9f2",
  border: "#dcd3bf",
  input: "#dcd3bf",
  ring: "#6e1d24",
};

const stackTheme = {
  light: stackThemeColors,
  dark: stackThemeColors,
  radius: "3px",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Header chrome only: resolve the signed-in user's cells (if any).
  // Failures here must never take the whole shell down.
  let signedIn = false;
  let cells: string[] = [];
  try {
    const user = await getOptionalUser();
    if (user) {
      signedIn = true;
      const investorId = await getInvestorIdForAuthUser(user.authUserId);
      if (investorId) {
        const positions = await getPositions(investorId);
        cells = [...new Set(positions.map((p) => p.cell))];
      }
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
              <Header signedIn={signedIn} cells={cells} />
              <main className="container">{children}</main>
              <Footer />
            </div>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
