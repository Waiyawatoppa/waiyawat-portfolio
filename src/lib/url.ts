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

/**
 * Video id from a YouTube watch/short/embed URL, or null. Used to turn a bare
 * YouTube link on its own line into an embed.
 */
export function youtubeId(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/);
      id = match?.[1] ?? null;
    }
  }

  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}
