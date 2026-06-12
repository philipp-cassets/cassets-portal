"use client";

import { useState } from "react";
import { useStackApp } from "@stackframe/stack";

/**
 * Magic-link request form. Before sending, the return target is parked in a
 * short-lived cookie that /api/post-login reads after the link is clicked
 * (whitelisted paths only). The email itself is sent by Stack Auth; clicking
 * it signs the viewer in (creating the account on first use).
 */
export function DataroomSignInForm({ next }: { next: string }) {
  const app = useStackApp();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setError(null);
    setSending(true);
    try {
      document.cookie = `dataroom_next=${encodeURIComponent(
        next
      )}; path=/; max-age=1800; SameSite=Lax`;
      const result = await app.sendMagicLinkEmail(email.trim());
      if (result.status === "error") {
        setError(
          result.error?.message ?? "Could not send the link. Try again."
        );
      } else {
        setSent(true);
      }
    } catch {
      setError("Could not send the link. Try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="sent">
        Check your inbox: we sent an access link to <strong>{email}</strong>.
        Click it on this device to open the dataroom.
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <input
        type="email"
        required
        autoFocus
        placeholder="you@firm.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email address"
      />
      <button type="submit" disabled={sending || !email.trim()}>
        {sending ? "Sending…" : "Email me an access link"}
      </button>
      {error && <div className="err">{error}</div>}
    </form>
  );
}
