/**
 * Heading helpers shared by the rendered article and its table of contents.
 *
 * Both sides must agree on the generated ids, so the slug and the duplicate
 * suffixing live here rather than being reimplemented in each place.
 */

export type Heading = { id: string; text: string; level: 2 | 3 };

/**
 * Unicode-aware, so Thai headings produce usable anchors too.
 *
 * \p{M} matters here: Thai vowels and tone marks are combining marks, not
 * letters, so without it "แนวทางแก้ปัญหา" would slug to "แนวทางแก-ป-ญหา".
 */
export function slugifyHeading(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

/**
 * Tracks how often each slug has been seen so repeated headings get -1, -2...
 * Create one per document render.
 */
export function createIdFactory() {
  const seen = new Map<string, number>();
  return (text: string): string => {
    const base = slugifyHeading(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

/**
 * Pulls H2/H3 out of the markdown source for the table of contents.
 *
 * Done on the source rather than by scraping the DOM so the contents list is
 * server-rendered along with the article, and stays available to crawlers.
 * Fenced code blocks are skipped so a shell comment like `## build` is not
 * mistaken for a heading.
 */
export function extractHeadings(markdown: string): Heading[] {
  if (!markdown) return [];

  const nextId = createIdFactory();
  const headings: Heading[] = [];
  let inFence = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!match) continue;

    // Strip inline markdown so the contents entry reads as plain text.
    const text = match[2]
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`~]/g, "")
      .trim();

    if (!text) continue;

    headings.push({
      id: nextId(text),
      text,
      level: match[1].length === 2 ? 2 : 3,
    });
  }

  return headings;
}

/** Rough reading time, used in the article meta line. */
export function readingTimeMinutes(markdown: string): number {
  if (!markdown) return 1;
  const words = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`~\-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  // Thai does not use spaces, so fall back to a character estimate when the
  // word count looks implausibly low for the amount of text.
  const chars = markdown.length;
  const estimate = Math.max(words / 200, chars / 1000);
  return Math.max(1, Math.round(estimate));
}
