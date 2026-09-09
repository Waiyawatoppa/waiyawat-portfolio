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

/**
 * next/image throws at render time for a host that is not in remotePatterns,
 * which would turn one bad image URL inside a case study into a broken page.
 * Markdown images are checked against the same allowlist before rendering.
 */
export function isAllowedImageSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("/")) return true;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;

  try {
    const { hostname, protocol } = new URL(src);
    return protocol === "https:" && hostname === new URL(supabaseUrl).hostname;
  } catch {
    return false;
  }
}
