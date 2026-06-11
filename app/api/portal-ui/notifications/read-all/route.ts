import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { getInvestorIdForAuthUser } from "@/lib/auth";
import { markAllNotificationsRead } from "@/lib/data";
import { logAccess } from "@/lib/log";
import { isPreview, previewSession } from "@/lib/preview";

/**
 * POST — mark all of the investor's notifications read for the signed-in
 * auth user. No body: BOTH arguments to cassets.portal_mark_all_read
 * (SECURITY DEFINER, migration 014) come from the session — the auth user
 * directly, the investor id via the investor_users (status='active') mapping.
 *
 * The client fires this without awaiting (prototype behaviour); the server
 * still does the durable write and answers, so failures are visible in logs.
 */
export async function POST() {
  // --- session (never the request) ---
  let authUserId: string;
  let investorId: string | null;
  if (isPreview()) {
    authUserId = previewSession.authUserId;
    investorId = previewSession.investorId;
  } else {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    authUserId = user.id;
    investorId = await getInvestorIdForAuthUser(user.id);
  }
  if (!investorId) {
    return NextResponse.json(
      { error: "Account is not linked to an investor record." },
      { status: 403 }
    );
  }

  try {
    await markAllNotificationsRead(authUserId, investorId);
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("portal_mark_all_read failed:", e?.message ?? err);
    return NextResponse.json(
      { error: "Notifications could not be updated." },
      { status: 500 }
    );
  }

  logAccess(authUserId, investorId, "notifications_read_all", null);
  return NextResponse.json({ ok: true });
}
