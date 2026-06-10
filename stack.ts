import "server-only";
import { StackServerApp } from "@stackframe/stack";

/**
 * Stack Auth (Neon Auth) server app.
 * Reads NEXT_PUBLIC_STACK_PROJECT_ID, NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
 * and STACK_SECRET_SERVER_KEY from the environment.
 *
 * Magic-link is the primary sign-in method; enable it in the Stack Auth
 * dashboard (Auth Methods -> Magic Link / OTP).
 */
export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/handler/sign-in",
    afterSignIn: "/api/post-login",
    afterSignUp: "/api/post-login",
    afterSignOut: "/handler/sign-in",
  },
});
