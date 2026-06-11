import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import { getOptionalUser, getInvestorIdForAuthUser } from "@/lib/auth";
import { getNews, getPositions } from "@/lib/data";
import { isPreview } from "@/lib/preview";
import { Sidebar } from "@/components/Sidebar";
import { PortalHeader } from "@/components/PortalHeader";
import { Footer } from "@/components/Footer";
import "../globals.css";

// Auth UI chrome themed to the Analitica language: warm paper, ink,
// sage-olive primary, hairline borders. The handoff has no dark mode, so
// both Stack slots receive the light palette.
const stackLightColors = {
  background: "#F2F2F0",
  foreground: "#05050C",
  card: "#ffffff",
  cardForeground: "#05050C",
  popover: "#ffffff",
  popoverForeground: "#05050C",
  primary: "#3A3E2A",
  primaryForeground: "#F2F2F0",
  secondary: "#e4e2db",
  secondaryForeground: "#05050C",
  muted: "#e4e2db",
  mutedForeground: "#73706a",
  accent: "#e0e1d3",
  accentForeground: "#3A3E2A",
  destructive: "#9C4A33",
  destructiveForeground: "#F2F2F0",
  border: "#e0ded7",
  input: "#e0ded7",
  ring: "#3A3E2A",
};

const stackTheme = {
  light: stackLightColors,
  dark: stackLightColors,
  radius: "12px",
};

// Restores the persisted denomination before first paint (no flash), and
// removes the one-shot entrance-cascade class after it has played, exactly
// like the handoff prototype (2800ms). Light is the only theme. The class
// now lives on the shell wrapper (the landing page owns the body on /).
const initScript = `try{var d=localStorage.getItem("cassets-denom");if(d==="USD"||d==="NEAR")document.documentElement.dataset.denom=d}catch(e){}setTimeout(function(){var s=document.querySelector(".shell");if(s)s.classList.remove("entering")},2800);`;

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Shell chrome only: resolve the signed-in user (if any) and a quiet
  // notification count (published news visible to this investor in the
  // last 30 days). Failures here must never take the whole shell down.
  let signedIn = false;
  let displayName: string | null = null;
  let activated = false;
  let notifCount = 0;
  try {
    const user = await getOptionalUser();
    if (user) {
      signedIn = true;
      displayName = user.displayName;
      const investorId = await getInvestorIdForAuthUser(user.authUserId);
      if (investorId) {
        activated = true;
        const positions = await getPositions(investorId);
        const cells = [...new Set(positions.map((p) => p.cell))];
        const posts = await getNews(cells);
        const cutoff = Date.now() - 30 * 86400000;
        notifCount = posts.filter(
          (p) => new Date(p.published_at).getTime() >= cutoff
        ).length;
      }
    }
  } catch {
    // Render the shell regardless; pages enforce their own guards.
  }

  const shell = (
    <div className="shell entering">
      <Sidebar signedIn={signedIn} displayName={displayName} />
      <main className="canvas">
        <div className="content">
          <PortalHeader
            signedIn={signedIn}
            displayName={displayName}
            activated={activated}
            notifCount={notifCount}
          />
          {children}
          <Footer />
        </div>
      </main>
      <div className="stone" aria-hidden="true" />
    </div>
  );

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: initScript }} />
      {isPreview() ? (
        // PREVIEW-ONLY: no Stack client with fixture credentials, so the
        // screenshot loop stays free of auth noise. Deployed environments
        // always mount the provider.
        shell
      ) : (
        <StackProvider app={stackServerApp}>
          <StackTheme theme={stackTheme}>{shell}</StackTheme>
        </StackProvider>
      )}
    </>
  );
}
