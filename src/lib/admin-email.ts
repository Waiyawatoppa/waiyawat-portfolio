/**
 * Pure email comparison helpers. Kept free of any auth import so that both
 * `src/auth.ts` and `src/lib/admin.ts` can use them without a cycle.
 */

/**
 * NFKC-normalize before comparing so visually-identical Unicode homoglyphs
 * cannot satisfy the admin equality check.
 */
export function normalizeEmail(value: string): string {
  return value.normalize("NFKC").trim().toLowerCase();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!email || !adminEmail) return false;
  return normalizeEmail(email) === normalizeEmail(adminEmail);
}
