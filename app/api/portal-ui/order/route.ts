import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { getInvestorIdForAuthUser } from "@/lib/auth";
import { getPositions } from "@/lib/data";
import { query } from "@/lib/db";
import { logAccess } from "@/lib/log";
import { isPreview, previewSession, previewData } from "@/lib/preview";

/**
 * POST { type: 'subscription'|'redemption', cell, share_class, amount, note? }
 * — place a new order from the portal's Pending Orders form.
 *
 * Session identity only: the investor id comes EXCLUSIVELY from the Stack
 * session -> investor_users (status='active') mapping; nothing in the body
 * can name an investor.
 *
 * DENOMINATION (house rule): the form's CLASS select fixes the denomination.
 *  - subscription: `amount` is in the class's own denomination; we resolve
 *    that denomination from the investor's position row and pass EXACTLY ONE
 *    of (amount_usd, amount_near) to cassets.portal_request_subscription —
 *    never both, never converted.
 *  - redemption: the design's form takes an "amount"; for redemptions it is
 *    interpreted as UNITS of the class (the form re-labels accordingly) and
 *    routed through the same cassets.portal_request_redemption function the
 *    existing redemption flow uses.
 *
 * The jsonb readback is verified (id present + row re-read from the
 * investor-scoped portal view) before reporting success, and the response
 * carries a `order` row in the Pending Orders table shape.
 */

type OrderRow = {
  ref: string;
  kind: "Subscription" | "Redemption";
  cls: string;
  amount: { v: number; unit: "USD" | "NEAR" | "units" };
  placed: string;
  state: "UNDER REVIEW" | "APPROVED";
};

function placedToday(): string {
  const now = new Date();
  const mon = now.toLocaleDateString("en-US", { month: "short" });
  return `${mon} ${now.getDate()}, ${now.getFullYear()}`;
}

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

  const type = b.type === "redemption" ? "redemption" : b.type === "subscription" ? "subscription" : null;
  const cell = typeof b.cell === "string" ? b.cell.trim() : "";
  const shareClass = typeof b.share_class === "string" ? b.share_class.trim() : "";
  const amount =
    typeof b.amount === "number"
      ? b.amount
      : typeof b.amount === "string" && b.amount.trim() !== ""
        ? Number(b.amount)
        : NaN;
  const note =
    typeof b.note === "string" && b.note.trim() !== ""
      ? b.note.trim().slice(0, 1000)
      : null;

  if (!type) {
    return NextResponse.json({ error: "Order type must be subscription or redemption." }, { status: 400 });
  }
  if (!cell || !shareClass) {
    return NextResponse.json({ error: "Cell and share class are required." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a number greater than zero." }, { status: 400 });
  }

  // The form only offers classes the investor holds; resolve the class
  // denomination from the investor's own position row (session-scoped).
  const positions = await getPositions(investorId);
  const pos = positions.find((p) => p.cell === cell && p.share_class === shareClass);
  if (!pos) {
    return NextResponse.json(
      { error: "Unknown share class for this account." },
      { status: 400 }
    );
  }

  if (type === "subscription") {
    // Exactly one of amount_usd / amount_near — the class's own denomination.
    const amountUsd = pos.denomination === "USD" ? amount : null;
    const amountNear = pos.denomination === "NEAR" ? amount : null;

    if (isPreview()) {
      const readback = previewData.subscriptionReadback(cell, shareClass, amountUsd, amountNear);
      const order: OrderRow = {
        ref: readback.ref,
        kind: "Subscription",
        cls: shareClass,
        amount: { v: amount, unit: pos.denomination },
        placed: placedToday(),
        state: "UNDER REVIEW",
      };
      return NextResponse.json({ request: readback, order }, { status: 201 });
    }

    type SubReadback = { id: string; ref: string; status: string };
    let readback: SubReadback;
    try {
      const rows = await query<{ result: SubReadback }>(
        `SELECT cassets.portal_request_subscription($1, $2, $3, $4, $5, $6) AS result`,
        [investorId, cell, shareClass, amountUsd, amountNear, note]
      );
      const result = rows[0]?.result;
      if (!result || !result.id) {
        console.error("portal_request_subscription returned no readback id");
        return NextResponse.json(
          { error: "The order could not be confirmed. Please contact your representative." },
          { status: 500 }
        );
      }
      readback = result;
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e?.code === "P0001" && e.message) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      console.error("portal_request_subscription failed:", e?.message ?? err);
      return NextResponse.json(
        { error: "The order could not be placed. Please try again." },
        { status: 500 }
      );
    }

    // Verify the row actually materialized in the investor-scoped view
    // (never trust a bare success response).
    const verify = await query<{ ref: string; status: string }>(
      `SELECT ref, status
         FROM cassets.v_portal_subscription_requests
        WHERE id = $1 AND investor_id = $2
        LIMIT 1`,
      [readback.id, investorId]
    );
    if (!verify[0]) {
      console.error("subscription request not found in view after insert:", readback.id);
      return NextResponse.json(
        { error: "The order could not be confirmed. Please contact your representative." },
        { status: 500 }
      );
    }

    logAccess(
      authUserId,
      investorId,
      "subscription_requested",
      `ref=${verify[0].ref} cell=${cell} class=${shareClass} amount=${amount} ${pos.denomination}`
    );

    const order: OrderRow = {
      ref: verify[0].ref,
      kind: "Subscription",
      cls: shareClass,
      amount: { v: amount, unit: pos.denomination },
      placed: placedToday(),
      state: verify[0].status === "approved" ? "APPROVED" : "UNDER REVIEW",
    };
    return NextResponse.json({ request: readback, order }, { status: 201 });
  }

  // --- redemption: amount = UNITS of the class ---
  if (isPreview()) {
    const readback = previewData.redemptionReadback(amount, shareClass);
    const order: OrderRow = {
      ref: readback.ref,
      kind: "Redemption",
      cls: shareClass,
      amount: { v: -Math.abs(amount), unit: "units" },
      placed: placedToday(),
      state: "UNDER REVIEW",
    };
    return NextResponse.json({ request: readback, order }, { status: 201 });
  }

  type RedReadback = { id: string; ref: string; units: string; share_class: string; status: string };
  let readback: RedReadback;
  try {
    const rows = await query<{ result: RedReadback }>(
      `SELECT cassets.portal_request_redemption($1, $2, $3, $4, $5) AS result`,
      [investorId, cell, shareClass, amount, note]
    );
    const result = rows[0]?.result;
    if (!result || !result.id) {
      console.error("portal_request_redemption returned no readback id");
      return NextResponse.json(
        { error: "The order could not be confirmed. Please contact your representative." },
        { status: 500 }
      );
    }
    readback = result;
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e?.code === "P0001" && e.message) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("portal_request_redemption failed:", e?.message ?? err);
    return NextResponse.json(
      { error: "The order could not be placed. Please try again." },
      { status: 500 }
    );
  }

  const verify = await query<{ ref: string; status: string }>(
    `SELECT ref, status
       FROM cassets.v_portal_redemption_requests
      WHERE id = $1 AND investor_id = $2
      LIMIT 1`,
    [readback.id, investorId]
  );
  if (!verify[0]) {
    console.error("redemption request not found in view after insert:", readback.id);
    return NextResponse.json(
      { error: "The order could not be confirmed. Please contact your representative." },
      { status: 500 }
    );
  }

  logAccess(
    authUserId,
    investorId,
    "redemption_requested",
    `ref=${verify[0].ref} cell=${cell} class=${shareClass} units=${amount}`
  );

  const order: OrderRow = {
    ref: verify[0].ref,
    kind: "Redemption",
    cls: shareClass,
    amount: { v: -Math.abs(amount), unit: "units" },
    placed: placedToday(),
    state: verify[0].status === "approved" ? "APPROVED" : "UNDER REVIEW",
  };
  return NextResponse.json({ request: readback, order }, { status: 201 });
}
