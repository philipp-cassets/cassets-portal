import { stackServerApp } from "@/stack";
import { getInvestorIdForAuthUser } from "@/lib/auth";
import { getDocumentForInvestor } from "@/lib/data";
import { logAccess } from "@/lib/log";

/**
 * Streams a document's bytea content. Guard chain:
 *   1. valid Stack Auth session
 *   2. active investor_users mapping
 *   3. the document's investor_id (via v_portal_documents, published-only)
 *      must equal the session investor - enforced inside the SQL join.
 * Every successful download is access-logged (fire-and-forget).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await stackServerApp.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const investorId = await getInvestorIdForAuthUser(user.id);
  if (!investorId) {
    return new Response("Forbidden", { status: 403 });
  }

  const doc = await getDocumentForInvestor(id, investorId);
  if (!doc) {
    // Not found OR not owned by this investor - identical response either
    // way, so document ids cannot be probed.
    return new Response("Not found", { status: 404 });
  }

  logAccess(
    user.id,
    investorId,
    "document_download",
    `document_id=${id} filename=${doc.filename}`
  );

  const safeFilename = doc.filename.replace(/[^\w.\- ]+/g, "_");
  return new Response(new Uint8Array(doc.content), {
    status: 200,
    headers: {
      "Content-Type": doc.mime_type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeFilename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
