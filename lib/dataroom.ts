import "server-only";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack";
import { authConfigured } from "./auth-ready";
import { isPreview } from "./preview";

/**
 * Dataroom: the three public-design documents gated behind a Stack Auth
 * magic-link session, with anonymous-to-peers feedback. Viewers are ANY
 * signed-in Stack user (no investor activation required); identities are
 * only ever shown on the admin page.
 */

export const DATAROOM_DOCS = {
  cassets: { title: "cAssets — Investment Thesis", path: "/cassets" },
  "how-it-works": { title: "cNEAR — How It Works", path: "/how-it-works" },
  thesis: { title: "The Case for NEAR — Investment Thesis", path: "/thesis" },
} as const;

export type DataroomDoc = keyof typeof DATAROOM_DOCS;

export function isDataroomDoc(v: string): v is DataroomDoc {
  return v in DATAROOM_DOCS;
}

/** Paths post-login is allowed to bounce back to (cookie value whitelist). */
export const DATAROOM_RETURN_PATHS: string[] = [
  "/dataroom",
  ...Object.values(DATAROOM_DOCS).map((d) => d.path),
];

export type DataroomViewer = {
  authUserId: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
};

function adminEmails(): string[] {
  return (
    process.env.DATAROOM_ADMIN_EMAILS ?? "philipp.suarez@near.foundation"
  )
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isDataroomAdmin(email: string | null | undefined): boolean {
  return Boolean(email) && adminEmails().includes(String(email).toLowerCase());
}

/** Resolve the signed-in dataroom viewer, or null when anonymous. */
export async function getDataroomViewer(): Promise<DataroomViewer | null> {
  if (isPreview()) {
    return {
      authUserId: "preview-user",
      email: "preview@cassets.xyz",
      displayName: "Preview viewer",
      isAdmin: true,
    };
  }
  if (!authConfigured()) return null;
  const user = await stackServerApp.getUser();
  if (!user) return null;
  const email = user.primaryEmail ?? null;
  return {
    authUserId: user.id,
    email,
    displayName: user.displayName ?? email,
    isAdmin: isDataroomAdmin(email),
  };
}

/**
 * Page guard for the three dataroom documents. Anonymous visitors are sent
 * to the magic-link sign-in with a return target. While auth is not
 * configured (local placeholder keys), the documents stay open and the
 * caller receives null, so the feedback panel simply is not rendered.
 */
export async function requireDataroomViewer(
  slug: DataroomDoc
): Promise<DataroomViewer | null> {
  if (!authConfigured() && !isPreview()) return null;
  const viewer = await getDataroomViewer();
  if (!viewer) {
    redirect(
      `/dataroom?next=${encodeURIComponent(DATAROOM_DOCS[slug].path)}`
    );
  }
  return viewer;
}
