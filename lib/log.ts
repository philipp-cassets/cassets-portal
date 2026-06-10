import "server-only";
import { getPool } from "./db";
import { isPreview } from "./preview";

/**
 * Fire-and-forget access log write. MUST never block or fail rendering:
 * we deliberately do not await this at call sites, and every failure path
 * is swallowed (logged to server console only). No-op in preview mode,
 * which never touches the database.
 */
export function logAccess(
  authUserId: string,
  investorId: string | null,
  action: string,
  detail: string | null = null
): void {
  if (isPreview()) return;
  try {
    getPool()
      .query(
        `INSERT INTO cassets.portal_access_log (auth_user_id, investor_id, action, detail)
         VALUES ($1, $2, $3, $4)`,
        [authUserId, investorId, action, detail]
      )
      .catch((err) => {
        console.error("portal_access_log insert failed:", err?.message ?? err);
      });
  } catch (err) {
    console.error("portal_access_log insert failed (sync):", err);
  }
}
