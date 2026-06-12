import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { authConfigured } from "@/lib/auth-ready";

/**
 * Deploy-time wiring check for the dataroom: confirms the portal role can
 * reach dataroom.comments and whether Stack Auth keys are live. No data,
 * no identities, no secrets.
 */
export async function GET() {
  let db: "ok" | "error" = "ok";
  try {
    await query("SELECT count(*) FROM dataroom.comments");
  } catch {
    db = "error";
  }
  return NextResponse.json(
    { ok: db === "ok", db, auth: authConfigured() },
    { status: db === "ok" ? 200 : 500 }
  );
}
