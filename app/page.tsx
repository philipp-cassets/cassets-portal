import { redirect } from "next/navigation";
import { requirePortalSession } from "@/lib/auth";
import { PendingActivation } from "@/components/PendingActivation";

/**
 * Root: the old in-app dashboard is superseded by the vendored design
 * prototype served at /portal. After the real auth gate resolves:
 *   no session         -> requirePortalSession redirects to Stack sign-in
 *   pending activation -> PendingActivation (no investor queries run)
 *   activated          -> the prototype surface
 */
export default async function Home() {
  const session = await requirePortalSession();
  if (!session.investorId) {
    return <PendingActivation displayName={session.displayName} />;
  }
  redirect("/portal");
}
