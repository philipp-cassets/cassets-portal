import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DATAROOM_DOCS, getDataroomViewer, isDataroomDoc } from "@/lib/dataroom";
import { query } from "@/lib/db";
import { isPreview } from "@/lib/preview";
import "../dataroom.css";

/**
 * Admin view of ALL dataroom feedback WITH identities. Server-rendered only;
 * the comments API never exposes names. Access is limited to the
 * DATAROOM_ADMIN_EMAILS allowlist.
 */
export const metadata: Metadata = { title: "Dataroom · All feedback" };

type AdminRow = {
  id: string;
  doc: string;
  email: string | null;
  display_name: string | null;
  body: string;
  created_at: string;
};

export default async function DataroomAdmin() {
  const viewer = await getDataroomViewer();
  if (!viewer) redirect("/dataroom?next=%2Fdataroom");
  if (!viewer.isAdmin) redirect("/dataroom");

  const rows: AdminRow[] = isPreview()
    ? []
    : await query<AdminRow>(
        `SELECT id, doc, email, display_name, body, created_at
           FROM dataroom.comments
          ORDER BY created_at DESC`
      );

  return (
    <div className="droom">
      <div className="halo" />
      <div className="card wide">
        <div className="logo">
          <span className="c">c</span>
          <span className="rest">Assets</span>
        </div>
        <div className="eyebrow">Dataroom · Admin</div>
        <h1>All feedback, with identities</h1>
        <div className="acount">
          {rows.length} comment{rows.length === 1 ? "" : "s"} · viewers see
          each other as &quot;Viewer N&quot; only
        </div>
        {rows.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Document</th>
                <th>From</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="when">
                    {new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}
                  </td>
                  <td className="doccol">
                    {isDataroomDoc(r.doc) ? (
                      <a
                        href={DATAROOM_DOCS[r.doc].path}
                        style={{ color: "inherit" }}
                      >
                        {r.doc}
                      </a>
                    ) : (
                      r.doc
                    )}
                  </td>
                  <td className="who">
                    {r.email ?? "unknown"}
                    {r.display_name && r.display_name !== r.email ? (
                      <div style={{ fontWeight: 500, color: "var(--mut)" }}>
                        {r.display_name}
                      </div>
                    ) : null}
                  </td>
                  <td className="body-col">{r.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="sub" style={{ marginTop: 22 }}>
            No feedback yet.
          </p>
        )}
        <div className="meta">
          <a href="/dataroom">← Dataroom</a>
        </div>
      </div>
    </div>
  );
}
