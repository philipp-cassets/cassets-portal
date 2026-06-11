import { SectionHead } from "@/components/SectionHead";
import { AttestationSection } from "./AttestationSection";

/**
 * PUBLIC page - no auth, no database reads. Explains the upcoming on-chain
 * attestation reporting. When the platform publishes a transparency view,
 * swap the placeholder inside <AttestationSection /> for a server component
 * that reads it.
 */
export default function TransparencyPage() {
  return (
    <section className="page-section">
      <div className="fade-1">
        <SectionHead title="Transparency" />
      </div>

      <div className="transparency-hero fade-2">
        <p>
          cAssets is a multi-cell asset management platform incorporated in
          Jersey. Each cell holds a defined asset strategy; the first cell,
          cNEAR, holds NEAR tokens under institutional custody.
        </p>
        <p>
          We are building on-chain attestation reporting: independently
          verifiable, regularly published proofs that reconcile each cell&apos;s
          custodied holdings against its issued units and published net asset
          value. Reserve attestations will be published here, on a fixed
          cadence, without requiring an investor login.
        </p>
        <p>
          Until then, investors receive their statements and NAV publications
          directly through the investor portal.
        </p>
      </div>

      <AttestationSection />
    </section>
  );
}
