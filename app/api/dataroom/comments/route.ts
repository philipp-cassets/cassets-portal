import { NextResponse } from "next/server";
import { getDataroomViewer, isDataroomDoc } from "@/lib/dataroom";
import { query } from "@/lib/db";
import { isPreview } from "@/lib/preview";

/**
 * Dataroom feedback API. Session required (any signed-in Stack user).
 * Responses are ALWAYS anonymized: a viewer sees their own comments as
 * "You" and everyone else as a stable "Viewer N" ordinal (order of first
 * comment on the doc). Identities live only in the table and are surfaced
 * exclusively on the server-rendered admin page.
 */

export type CommentOut = {
  id: string;
  body: string;
  createdAt: string;
  mine: boolean;
  label: string;
};

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  auth_user_id: string;
  anon_n: string;
};

async function listComments(
  doc: string,
  viewerId: string
): Promise<CommentOut[]> {
  const rows = await query<CommentRow>(
    `SELECT c.id, c.body, c.created_at, c.auth_user_id,
            DENSE_RANK() OVER (ORDER BY f.first_at, c.auth_user_id) AS anon_n
       FROM dataroom.comments c
       JOIN (SELECT auth_user_id, MIN(created_at) AS first_at
               FROM dataroom.comments
              WHERE doc = $1
              GROUP BY auth_user_id) f
         ON f.auth_user_id = c.auth_user_id
      WHERE c.doc = $1
      ORDER BY c.created_at ASC`,
    [doc]
  );
  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: new Date(r.created_at).toISOString(),
    mine: r.auth_user_id === viewerId,
    label: r.auth_user_id === viewerId ? "You" : `Viewer ${r.anon_n}`,
  }));
}

export async function GET(request: Request) {
  const viewer = await getDataroomViewer();
  if (!viewer) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const doc = new URL(request.url).searchParams.get("doc") ?? "";
  if (!isDataroomDoc(doc)) {
    return NextResponse.json({ error: "unknown doc" }, { status: 400 });
  }
  if (isPreview()) return NextResponse.json({ comments: [] });
  const comments = await listComments(doc, viewer.authUserId);
  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const viewer = await getDataroomViewer();
  if (!viewer) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let payload: { doc?: unknown; body?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const doc = typeof payload.doc === "string" ? payload.doc : "";
  const body =
    typeof payload.body === "string" ? payload.body.trim() : "";
  if (!isDataroomDoc(doc)) {
    return NextResponse.json({ error: "unknown doc" }, { status: 400 });
  }
  if (body.length < 1 || body.length > 4000) {
    return NextResponse.json(
      { error: "comment must be 1-4000 characters" },
      { status: 400 }
    );
  }
  if (isPreview()) {
    return NextResponse.json({
      comment: {
        id: "preview",
        body,
        createdAt: new Date().toISOString(),
        mine: true,
        label: "You",
      } satisfies CommentOut,
    });
  }
  const rows = await query<{ id: string; created_at: string }>(
    `INSERT INTO dataroom.comments (doc, auth_user_id, email, display_name, body)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, created_at`,
    [doc, viewer.authUserId, viewer.email, viewer.displayName, body]
  );
  return NextResponse.json({
    comment: {
      id: rows[0].id,
      body,
      createdAt: new Date(rows[0].created_at).toISOString(),
      mine: true,
      label: "You",
    } satisfies CommentOut,
  });
}
