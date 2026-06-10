import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { getInvestorIdForAuthUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { logAccess } from "@/lib/log";
import { isPreview, previewSession, previewData } from "@/lib/preview";

type Readback = {
  id: string;
  ref: string;
  units: string;
  share_class: string;
  status: string;
};

/**
 * POST { cell, share_class, units, note? } - lodge a redemption request.
 *
 * The investor id comes ONLY from the session; the body cannot name an
 * investor. Holdings are validated server-side inside
 * cassets.portal_request_redemption, which returns a jsonb readback
 * { id, ref, units, share_class, status } or RAISEs (insufficient units,
 * unknown class, suspended investor); raised messages map to 400.
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

  // --- input validation ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;

  const cell = typeof b.cell === "string" ? b.cell.trim() : "";
  const shareClass = typeof b.share_class === "string" ? b.share_class.trim() : "";
  const unitsNum =
    typeof b.units === "number"
      ? b.units
      : typeof b.units === "string" && b.units.trim() !== ""
        ? Number(b.units)
        : NaN;
  const note =
    typeof b.note === "string" && b.note.trim() !== ""
      ? b.note.trim().slice(0, 1000)
      : null;

  if (!cell || !shareClass) {
    return NextResponse.json(
      { error: "Cell and share class are required." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(unitsNum) || unitsNum <= 0) {
    return NextResponse.json(
      { error: "Units must be a number greater than zero." },
      { status: 400 }
    );
  }

  // --- preview short-circuit: no DB ---
  if (isPreview()) {
    const readback = previewData.redemptionReadback(unitsNum, shareClass);
    return NextResponse.json({ request: readback }, { status: 201 });
  }

  // --- lodge via the registry function (validates holdings server-side) ---
  let readback: Readback;
  try {
    const rows = await query<{ result: Readback }>(
      `SELECT cassets.portal_request_redemption($1, $2, $3, $4, $5) AS result`,
      [investorId, cell, shareClass, unitsNum, note]
    );
    const result = rows[0]?.result;
    if (!result || !result.id) {
      console.error("portal_request_redemption returned no readback id");
      return NextResponse.json(
        { error: "The request could not be confirmed. Please contact your representative." },
        { status: 500 }
      );
    }
    readback = result;
  } catch (err: unknown) {
    // RAISE EXCEPTION inside the function (insufficient units, unknown
    // class, suspended investor) surfaces as P0001; report the message.
    const e = err as { code?: string; message?: string };
    if (e?.code === "P0001" && e.message) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("portal_request_redemption failed:", e?.message ?? err);
    return NextResponse.json(
      { error: "The request could not be lodged. Please try again." },
      { status: 500 }
    );
  }

  logAccess(
    authUserId,
    investorId,
    "redemption_requested",
    `ref=${readback.ref} cell=${cell} class=${shareClass} units=${unitsNum}`
  );

  return NextResponse.json({ request: readback }, { status: 201 });
}
