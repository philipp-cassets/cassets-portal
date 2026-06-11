import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import { authConfigured } from "@/lib/auth-ready";

/**
 * Stack Auth (Neon Auth) handler routes: sign-in, sign-out, magic-link
 * callback, account settings, etc. Magic link must be enabled as an auth
 * method in the Stack Auth dashboard.
 *
 * Until Neon Auth is enabled (placeholder keys in force), render a calm
 * notice instead of mounting the Stack client, which throws client-side
 * on a fake project id.
 */
export default function Handler(props: unknown) {
  if (!authConfigured()) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#F2F2F0",
          color: "#05050C",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 21, fontWeight: 600, marginBottom: 10 }}>
            Investor access is being enabled
          </div>
          <div style={{ fontSize: 14.5, color: "rgba(0,0,0,0.45)", maxWidth: 420 }}>
            Sign-in for the cNEAR investor portal opens shortly. For access or
            questions, write to{" "}
            <a href="mailto:investors@cassets.xyz" style={{ color: "#05050C" }}>
              investors@cassets.xyz
            </a>
            .
          </div>
          <div style={{ marginTop: 18 }}>
            <a
              href="/demo"
              style={{ fontSize: 13.5, color: "#05050C", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              View a demonstration portal (fictitious data)
            </a>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="auth-shell">
      <StackHandler fullPage app={stackServerApp} routeProps={props} />
    </div>
  );
}
