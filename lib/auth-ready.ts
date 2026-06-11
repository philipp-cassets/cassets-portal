/**
 * Neon Auth readiness. The production project carries documented placeholder
 * Stack keys until Neon Auth is enabled in the Neon console (real keys then
 * replace them). While placeholders are in force, every auth surface must
 * short-circuit to a notice instead of mounting the Stack client, which
 * throws client-side on a fake project id.
 */
export function authConfigured(): boolean {
  const id = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
  const secret = process.env.STACK_SECRET_SERVER_KEY ?? "";
  return Boolean(id) && !secret.startsWith("ssk_placeholder");
}
