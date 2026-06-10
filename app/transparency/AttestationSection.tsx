/**
 * Placeholder server component for on-chain attestation reporting.
 *
 * When the platform side publishes a public transparency view (e.g.
 * cassets.v_public_attestations), implement the data read here — this
 * component is already a server component, so it can query directly and
 * render attestation rows in place of the placeholder slot. The page
 * around it does not need to change.
 */
export function AttestationSection() {
  return (
    <section className="attestation-placeholder">
      <h2 className="section-title">Reserve attestations</h2>
      <div className="slot">
        On-chain attestation reporting is in preparation.
        <br />
        When attestations are published, they will appear here, on schedule
        and without a login.
      </div>
    </section>
  );
}
