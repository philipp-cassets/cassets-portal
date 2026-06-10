/**
 * Shown when a signed-in auth user has no active investor_users mapping.
 * No investor data is queried or rendered in this state.
 */
export function PendingActivation({ displayName }: { displayName: string }) {
  return (
    <div className="pending-screen">
      <span className="chip pending">Pending activation</span>
      <h1>Your account awaits activation</h1>
      <p>
        Welcome, {displayName}. Your sign-in was successful, but your account
        has not yet been linked to an investor record.
      </p>
      <p>
        Our investor relations team reviews and activates new portal accounts,
        typically within one business day. You will receive an email once your
        access is ready. If you believe this is taking longer than expected,
        please contact your cAssets representative.
      </p>
    </div>
  );
}
