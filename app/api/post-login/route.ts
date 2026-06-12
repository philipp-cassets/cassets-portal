import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stackServerApp } from "@/stack";
import { getInvestorIdForAuthUser } from "@/lib/auth";
import { logAccess } from "@/lib/log";
import { DATAROOM_RETURN_PATHS } from "@/lib/dataroom";

/**
 * Stack Auth redirects here after sign-in / sign-up (urls.afterSignIn).
 * Writes the required 'login' access-log entry (fire-and-forget) and routes
 * the user:
 *   dataroom_next cookie set -> back to the dataroom document they wanted
 *   activated investor       -> / (which forwards to /portal)
 *   anyone else              -> /dataroom (document index)
 * The cookie is set by the dataroom sign-in form right before the magic
 * link is sent; only whitelisted paths are honoured.
 */
export async function GET(request: Request) {
  const user = await stackServerApp.getUser();
  let investorId: string | null = null;
  if (user) {
    try {
      investorId = await getInvestorIdForAuthUser(user.id);
    } catch {
      // log with null investor_id rather than failing the redirect
    }
    logAccess(user.id, investorId, "login", null);
  }

  const jar = await cookies();
  const rawNext = jar.get("dataroom_next")?.value ?? null;
  const next =
    rawNext && DATAROOM_RETURN_PATHS.includes(rawNext) ? rawNext : null;

  let target = "/";
  if (next) target = next;
  else if (user && !investorId) target = "/dataroom";

  const response = NextResponse.redirect(new URL(target, request.url));
  if (rawNext) {
    response.cookies.set("dataroom_next", "", { path: "/", maxAge: 0 });
  }
  return response;
}
