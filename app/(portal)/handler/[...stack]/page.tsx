import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack";

/**
 * Stack Auth (Neon Auth) handler routes: sign-in, sign-out, magic-link
 * callback, account settings, etc. Magic link must be enabled as an auth
 * method in the Stack Auth dashboard.
 */
export default function Handler(props: unknown) {
  return (
    <div className="auth-shell">
      <StackHandler fullPage app={stackServerApp} routeProps={props} />
    </div>
  );
}
