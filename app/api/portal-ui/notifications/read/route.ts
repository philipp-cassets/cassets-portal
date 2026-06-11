import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { getInvestorIdForAuthUser } from "@/lib/auth";
import { markNotificationRead } from "@/lib/data";
import { logAccess } from "@/lib/log";
import { isPreview, previewSession } from "@/lib/preview";

/**
 * POST { id } — mark one notification read for the signed-in auth user.
 *
 * Session identity only: the auth user (read-state owner) comes EXCLUSIVELY
 * from the Stack session; the body can only name a notification id. Ownership
 * is enforced inside cassets.portal_mark_notification_read (SECURITY DEFINER,
 * migration 014) — a foreign id is a silent no-op there, never a write.
 *
 * The client fires this without awaiting (prototype behaviour); the server
 * still does the durable write and answers, so failures are visible in logs.
 */
export async function POST(request: Request) {
  // --- session (never the body) ---
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

  // --- input validation: a bigint id, nothing else ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const raw = (body as Record<string, unknown> | null)?.id;
  const id = typeof raw === "number" || typeof raw === "string" ? String(raw) : "";
  if (!/^\d{1,18}$/.test(id)) {
    return NextResponse.json({ error: "A notification id is required." }, { status: 400 });
  }

  try {
    await markNotificationRead(authUserId, id);
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("portal_mark_notification_read failed:", e?.message ?? err);
    return NextResponse.json(
      { error: "The notification could not be updated." },
      { status: 500 }
    );
  }

  logAccess(authUserId, investorId, "notification_read", `id=${id}`);
  return NextResponse.json({ ok: true });
}
