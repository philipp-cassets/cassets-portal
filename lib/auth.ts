import "server-only";
import { stackServerApp } from "@/stack";
import { query } from "./db";

export type PortalSession = {
  /** Stack Auth user id */
  authUserId: string;
  /** Display name / email for the header */
  displayName: string;
  /**
   * The investor this auth user is mapped to via cassets.investor_users with
   * status = 'active'. Null means signed in but not (yet) activated -> pages
   * must show the "pending activation" screen and run NO investor queries.
   */
  investorId: string | null;
};

/**
 * Look up the active investor mapping for an auth user.
 * Only rows with status = 'active' grant access.
 */
export async function getInvestorIdForAuthUser(
  authUserId: string
): Promise<string | null> {
  const rows = await query<{ investor_id: string }>(
    `SELECT investor_id
       FROM cassets.investor_users
      WHERE auth_user_id = $1
        AND status = 'active'
      LIMIT 1`,
    [authUserId]
  );
  return rows[0]?.investor_id ?? null;
}

/**
 * Page guard for authed pages. Redirects to sign-in when no session exists,
 * then resolves the investor mapping. Every investor-data query downstream
 * MUST filter on session.investorId.
 */
export async function requirePortalSession(): Promise<PortalSession> {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const investorId = await getInvestorIdForAuthUser(user.id);
  return {
    authUserId: user.id,
    displayName: user.displayName ?? user.primaryEmail ?? "Investor",
    investorId,
  };
}

/** Optional session (for the shared header on public pages). */
export async function getOptionalUser(): Promise<{
  authUserId: string;
  displayName: string;
} | null> {
  const user = await stackServerApp.getUser();
  if (!user) return null;
  return {
    authUserId: user.id,
    displayName: user.displayName ?? user.primaryEmail ?? "Investor",
  };
}
