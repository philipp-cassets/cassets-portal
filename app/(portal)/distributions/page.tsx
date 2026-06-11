import { requirePortalSession } from "@/lib/auth";
import { PendingActivation } from "@/components/PendingActivation";
import { SectionHead } from "@/components/SectionHead";

/**
 * Distributions, per the handoff nav. The cell currently accumulates;
 * no distributions have been declared, so this renders the empty state.
 * When the platform exposes a distributions view, add the investor-scoped
 * query in lib/data.ts (filtered on investor_id) and render the hairline
 * table here in the same system.
 */
export default async function DistributionsPage() {
  const session = await requirePortalSession();

  if (!session.investorId) {
    return <PendingActivation displayName={session.displayName} />;
  }

  return (
    <section className="page-section">
      <div className="fade-1">
        <SectionHead title="Distributions" />
      </div>

      <p className="page-intro fade-1">
        Distributions declared by the cell are recorded here per share class,
        in the class&apos;s own denomination.
      </p>

      <div className="empty-state fade-2">No distributions declared.</div>
    </section>
  );
}
