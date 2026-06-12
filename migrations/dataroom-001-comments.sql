-- Dataroom feedback store. Applied 2026-06-12 with the Neon owner role
-- (this file is the record; the portal connects as cassets_portal).
--
-- Separate schema on purpose: the cassets schema is owned by the desk's
-- sha-tracked migration chain (cnear-desk scripts/migrate.js) and must not
-- gain out-of-band tables.

CREATE SCHEMA IF NOT EXISTS dataroom;

CREATE TABLE IF NOT EXISTS dataroom.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc text NOT NULL CHECK (doc IN ('cassets', 'how-it-works', 'thesis')),
  auth_user_id text NOT NULL,
  email text,
  display_name text,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_doc_created_idx
  ON dataroom.comments (doc, created_at);

GRANT USAGE ON SCHEMA dataroom TO cassets_portal;
GRANT SELECT, INSERT ON dataroom.comments TO cassets_portal;
