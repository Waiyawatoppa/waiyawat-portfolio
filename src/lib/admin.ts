import "server-only";

import { auth } from "@/auth";
import { isAdminEmail } from "./admin-email";

/**
 * Single source of truth for "is the current request the admin?", used by both
 * the admin pages and every Server Action. Returns false rather than throwing
 * on a missing session so callers choose between redirect and error.
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return isAdminEmail(session?.user?.email);
}

/**
 * Server Actions are reachable by direct POST, not only through our own UI,
 * so each one calls this rather than trusting that an admin page rendered.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}
