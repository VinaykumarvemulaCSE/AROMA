// Admin privileges are determined entirely by the `admin: true` custom claim
// set via the set-admin-claims.ts script.

export function hasAdminClaim(claims: Record<string, unknown> | null): boolean {
  if (!claims) return false;
  return claims.admin === true;
}
