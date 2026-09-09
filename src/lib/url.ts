/**
 * Returns the URL only if it is a safe, absolute http(s) link.
 *
 * The previous check was `value.startsWith('http')`, which is a prefix test
 * rather than a scheme test. Validation also happens on write in
 * src/app/admin/actions.ts; this is the render-time backstop for rows that
 * predate that validation.
 */
export function safeExternalUrl(
  value: string | null | undefined,
): string | null {
  if (!value) return null;

  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value)
    ? value
    : `https://${value}`;

  try {
    const { protocol } = new URL(candidate);
    if (protocol !== "https:" && protocol !== "http:") return null;
    return candidate;
  } catch {
    return null;
  }
}
