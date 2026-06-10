import "server-only";
import { Pool, types } from "pg";

// Keep numerics as strings (pg default); we format explicitly and never do
// arithmetic on them server-side. DATE columns come back as strings too.
types.setTypeParser(types.builtins.DATE, (v: string) => v);

declare global {
  // eslint-disable-next-line no-var
  var __cassetsPortalPool: Pool | undefined;
}

/**
 * Server-only connection pool for the `cassets_portal` Postgres role.
 * That role is SELECT-only on the cassets.v_portal_* views (+ investor_users,
 * investor_documents) and INSERT-only on cassets.portal_access_log.
 */
export function getPool(): Pool {
  if (!globalThis.__cassetsPortalPool) {
    const connectionString = process.env.PORTAL_DATABASE_URL;
    if (!connectionString) {
      throw new Error("PORTAL_DATABASE_URL is not set");
    }
    globalThis.__cassetsPortalPool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  }
  return globalThis.__cassetsPortalPool;
}

export async function query<T extends Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}
