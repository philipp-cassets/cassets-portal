import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { getInvestorIdForAuthUser } from "@/lib/auth";
import { logAccess } from "@/lib/log";

/**
 * Stack Auth redirects here after sign-in / sign-up (urls.afterSignIn).
 * Writes the required 'login' access-log entry (fire-and-forget) and sends
 * the user to the dashboard.
 */
export async function GET(request: Request) {
  const user = await stackServerApp.getUser();
  if (user) {
    let investorId: string | null = null;
    try {
      investorId = await getInvestorIdForAuthUser(user.id);
    } catch {
      // log with null investor_id rather than failing the redirect
    }
    logAccess(user.id, investorId, "login", null);
  }
  return NextResponse.redirect(new URL("/", request.url));
}
