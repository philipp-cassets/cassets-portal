import { requirePortalSession } from "@/lib/auth";
import { getDocuments, type DocumentRow } from "@/lib/data";
import { PendingActivation } from "@/components/PendingActivation";
import { logAccess } from "@/lib/log";
import { fmtDate } from "@/lib/format";

function docTypeLabel(t: string): string {
  // "monthly_statement" -> "Monthly statement"
  const s = t.replace(/[_-]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function periodLabel(d: DocumentRow): string {
  if (d.period_start && d.period_end) {
    return `${fmtDate(d.period_start)} – ${fmtDate(d.period_end)}`;
  }
  if (d.period_end) return `as of ${fmtDate(d.period_end)}`;
  if (d.period_start) return `from ${fmtDate(d.period_start)}`;
  return "—";
}

export default async function DocumentsPage() {
  const session = await requirePortalSession();

  if (!session.investorId) {
    return <PendingActivation displayName={session.displayName} />;
  }

  const docs = await getDocuments(session.investorId);

  // Required access-log entry for document page views (fire-and-forget).
  logAccess(session.authUserId, session.investorId, "documents_page_view", null);

  const groups = new Map<string, DocumentRow[]>();
  for (const d of docs) {
    const list = groups.get(d.doc_type) ?? [];
    list.push(d);
    groups.set(d.doc_type, list);
  }

  return (
    <>
      <h1 className="page-title">Documents</h1>
      <p className="page-subtitle">
        Statements, notices and reports published to your account.
      </p>

      {docs.length === 0 && (
        <div className="empty-state">No documents have been published yet.</div>
      )}

      {[...groups.entries()].map(([docType, list]) => (
        <section key={docType} className="doc-group">
          <h2>{docTypeLabel(docType)}</h2>
          <div className="card" style={{ padding: "8px 0" }}>
            <table className="data">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>File</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((d) => (
                  <tr key={d.id}>
                    <td>{periodLabel(d)}</td>
                    <td>{d.filename}</td>
                    <td className="num">
                      <a
                        className="download-link"
                        href={`/documents/${d.id}/download`}
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
