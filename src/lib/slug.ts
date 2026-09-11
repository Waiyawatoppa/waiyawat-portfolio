/**
 * URL slug from a title.
 *
 * Latin text is ASCII-folded ("Café" → "cafe") so slugs stay readable when
 * shared. Thai (and any other script without a Latin mapping) is kept as-is:
 * Next serves Unicode paths fine, and a transliterated Thai slug would be
 * unreadable to the people most likely to share it.
 */
export function slugifyTitle(title: string): string {
  const folded = title
    .normalize("NFKD")
    // Strip Latin diacritics only; Thai vowels/tone marks are also category M
    // but sit in the Thai block, so keep those.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const slug = folded
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");

  return slug;
}

/** What the server accepts. Mirrors the zod regex in admin/actions.ts. */
export const SLUG_PATTERN = /^[\p{L}\p{N}\p{M}]+(?:-[\p{L}\p{N}\p{M}]+)*$/u;
