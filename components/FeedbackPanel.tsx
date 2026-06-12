"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./feedback-panel.css";

/**
 * Floating feedback widget for dataroom documents. Lists the doc's comments
 * (always anonymized by the API: own comments as "You", everyone else as
 * "Viewer N") and posts new ones. Rendered only for signed-in viewers.
 */

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  mine: boolean;
  label: string;
};

function fmtWhen(iso: string): string {
  const d = new Date(iso);
  return `${d.toISOString().slice(0, 10)} ${d
    .toISOString()
    .slice(11, 16)} UTC`;
}

export function FeedbackPanel({
  doc,
  viewerEmail,
}: {
  doc: string;
  viewerEmail: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/dataroom/comments?doc=${encodeURIComponent(doc)}`
      );
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { comments: Comment[] };
      setComments(data.comments);
    } catch {
      setError("Could not load comments.");
      setComments([]);
    }
  }, [doc]);

  useEffect(() => {
    if (open && comments === null) void load();
  }, [open, comments, load]);

  useEffect(() => {
    // Keep the newest comment in view when the list changes.
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [comments]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/dataroom/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc, body }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { comment: Comment };
      setComments((prev) => [...(prev ?? []), data.comment]);
      setText("");
    } catch {
      setError("Could not post the comment. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {!open && (
        <button className="fb-btn" onClick={() => setOpen(true)}>
          <span className="dot" />
          Feedback
        </button>
      )}
      {open && (
        <div className="fb-panel" role="dialog" aria-label="Document feedback">
          <div className="fb-head">
            <div className="fb-title">Feedback</div>
            <button className="fb-close" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <div className="fb-note">
            Comments are shared with all viewers anonymously
            {viewerEmail ? <>; you are signed in as {viewerEmail}</> : null}.
            Only the cAssets team sees who wrote what.
          </div>
          <div className="fb-list" ref={listRef}>
            {comments === null ? (
              <div className="fb-empty">Loading…</div>
            ) : comments.length === 0 ? (
              <div className="fb-empty">
                No comments yet. Be the first to leave feedback.
              </div>
            ) : (
              comments.map((c) => (
                <div
                  className={c.mine ? "fb-item mine" : "fb-item"}
                  key={c.id}
                >
                  <div className="fb-meta">
                    <span className="fb-who">{c.label}</span>
                    <span className="fb-when">{fmtWhen(c.createdAt)}</span>
                  </div>
                  <div className="fb-body">{c.body}</div>
                </div>
              ))
            )}
          </div>
          <form className="fb-form" onSubmit={submit}>
            <textarea
              placeholder="Questions, pushback, anything unclear…"
              value={text}
              maxLength={4000}
              onChange={(e) => setText(e.target.value)}
              aria-label="Your feedback"
            />
            {error && <div className="fb-err">{error}</div>}
            <button
              className="fb-send"
              type="submit"
              disabled={sending || !text.trim()}
            >
              {sending ? "Sending…" : "Send feedback"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
