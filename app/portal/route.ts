import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { getInvestorIdForAuthUser } from "@/lib/auth";
import { isPreview } from "@/lib/preview";

/**
 * The investor portal surface: streams the vendored design prototype
 * (app/portal/index.html, byte-faithful apart from asset paths) only after
 * the real Stack Auth session and active investor mapping check out.
 *
 *   no session            -> Stack sign-in flow (app/handler/*)
 *   pending activation    -> "/" (renders the PendingActivation screen)
 *   PORTAL_PREVIEW=1      -> bypass, exactly like the rest of preview mode
 *
 * The page itself carries no investor data; everything arrives via the
 * session-validated /api/portal-ui/data bridge, which also writes the
 * page-view access log entry.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isPreview()) {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.redirect(new URL("/handler/sign-in", request.url));
    }
    const investorId = await getInvestorIdForAuthUser(user.id);
    if (!investorId) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const html = await fs.readFile(
    path.join(process.cwd(), "app", "portal", "index.html"),
    "utf8"
  );
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
