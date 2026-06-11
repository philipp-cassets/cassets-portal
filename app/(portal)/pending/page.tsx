import { redirect } from "next/navigation";
import { requirePortalSession } from "@/lib/auth";
import { PendingActivation } from "@/components/PendingActivation";

/**
 * Signed in but not yet linked to an investor record. The public landing
 * at / sends authenticated-but-unactivated users here so the pending
 * screen keeps the portal shell (this used to render at / itself before
 * the marketing landing took over the root).
 */
export default async function Pending() {
  const session = await requirePortalSession();
  if (session.investorId) {
    redirect("/portal");
  }
  return <PendingActivation displayName={session.displayName} />;
}
