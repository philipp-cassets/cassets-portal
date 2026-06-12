import type { Metadata } from "next";
import { StackProvider } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import { authConfigured } from "@/lib/auth-ready";
import {
  DATAROOM_DOCS,
  DATAROOM_RETURN_PATHS,
  getDataroomViewer,
} from "@/lib/dataroom";
import { DataroomSignInForm } from "./signin-form";
import "./dataroom.css";

/**
 * Dataroom entry: magic-link sign-in for anonymous visitors, document index
 * for signed-in viewers. Inherits the global noindex.
 */
export const metadata: Metadata = {
  title: "cAssets · Dataroom",
  description: "Investor dataroom for cAssets documents.",
};

export default async function Dataroom({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: rawNext } = await searchParams;
  const next =
    rawNext && DATAROOM_RETURN_PATHS.includes(rawNext) ? rawNext : "/dataroom";

  const viewer = await getDataroomViewer();

  return (
    <div className="droom">
      <div className="halo" />
      <div className={viewer ? "card wide" : "card"}>
        <div className="logo">
          <span className="c">c</span>
          <span className="rest">Assets</span>
        </div>

        {viewer ? (
          <>
            <div className="eyebrow">Dataroom</div>
            <h1>Documents</h1>
            <p className="sub">
              Feedback is welcome on every document: use the Feedback button
              on the page. Your comments appear anonymously to other viewers.
            </p>
            <div className="docs">
              {Object.entries(DATAROOM_DOCS).map(([slug, d]) => (
                <a className="doc-link" key={slug} href={d.path}>
                  <span className="doc-t">{d.title}</span>
                  <span className="doc-a">Open →</span>
                </a>
              ))}
            </div>
            <div className="meta">
              <span>
                Signed in{viewer.email ? <> as {viewer.email}</> : null} ·{" "}
                <a href="/handler/sign-out">Sign out</a>
              </span>
              {viewer.isAdmin && <a href="/dataroom/admin">Admin: all feedback</a>}
            </div>
          </>
        ) : authConfigured() ? (
          <>
            <div className="eyebrow">Dataroom access</div>
            <h1>Sign in with your email</h1>
            <p className="sub">
              Enter your email and we will send you a one-time access link. No
              password needed.
            </p>
            <StackProvider app={stackServerApp}>
              <DataroomSignInForm next={next} />
            </StackProvider>
          </>
        ) : (
          <>
            <div className="eyebrow">Dataroom access</div>
            <h1>Access is being enabled</h1>
            <p className="sub">
              Sign-in for the cAssets dataroom opens shortly. For access or
              questions, write to{" "}
              <a
                href="mailto:investors@cassets.xyz"
                style={{ color: "var(--ink)" }}
              >
                investors@cassets.xyz
              </a>
              .
            </p>
          </>
        )}
      </div>
      <div className="fine">
        cAssets Management Ltd · Jersey. Dataroom documents are confidential
        and intended for qualified non-US institutional investors only. Not an
        offer to sell.
      </div>
    </div>
  );
}
