import { requirePortalSession } from "@/lib/auth";
import { getDocuments, type DocumentRow } from "@/lib/data";
import { PendingActivation } from "@/components/PendingActivation";
import { SectionHead } from "@/components/SectionHead";
import { logAccess } from "@/lib/log";
import { fmtDate } from "@/lib/format";

function docTypeLabel(t: string): string {
  // "monthly_statement" -> "Monthly statement"
  const s = t.replace(/[_-]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fileExt(filename: string): string | null {
  const m = /\.([A-Za-z0-9]+)$/.exec(filename);
  return m ? m[1].toUpperCase() : null;
}

/** "May 2026" for a full-month period; explicit dates otherwise. */
function periodLabel(d: DocumentRow): string | null {
  if (d.period_start && d.period_end) {
    if (d.period_start.slice(0, 7) === d.period_end.slice(0, 7)) {
      const date = new Date(`${d.period_end.slice(0, 10)}T00:00:00Z`);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        });
      }
    }
    return `${fmtDate(d.period_start)} - ${fmtDate(d.period_end)}`;
  }
  if (d.period_end) return `as of ${fmtDate(d.period_end)}`;
  if (d.period_start) return `from ${fmtDate(d.period_start)}`;
  return null;
}

export default async function DocumentsPage() {
  const session = await requirePortalSession();

  if (!session.investorId) {
    return <PendingActivation displayName={session.displayName} />;
  }

  const docs = await getDocuments(session.investorId);

  // Required access-log entry for document page views (fire-and-forget).
  logAccess(session.authUserId, session.investorId, "documents_page_view", null);

  return (
    <section className="page-section">
      <div className="fade-1">
        <SectionHead title="Documents" />
      </div>

      {docs.length === 0 ? (
        <div className="empty-state fade-2">
          No documents have been issued to you. When they are, they will
          appear here, neatly filed.
        </div>
      ) : (
        <div className="doc-list fade-2">
          {docs.map((d) => {
            const period = periodLabel(d);
            const ext = fileExt(d.filename);
            const meta = [period, ext].filter(Boolean).join(" · ");
            return (
              <div className="doc-row" key={d.id}>
                <div className="doc-name">{docTypeLabel(d.doc_type)}</div>
                <div className="doc-period">{meta || d.filename}</div>
                <div className="doc-dl">
                  <a href={`/documents/${d.id}/download`}>
                    Download
                    <span className="arrow" aria-hidden="true">
                      &darr;
                    </span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
