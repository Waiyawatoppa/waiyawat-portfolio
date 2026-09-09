export const CATEGORIES = [
  "Tech + Biz",
  "Business",
  "Technology & Engineering",
  "Leader",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Project {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  cover_url: string;
  category: string;
  github_url?: string | null;
  live_url?: string | null;
  pdf_url?: string | null;
  /** Drafts are hidden from the public site, sitemap and static params. */
  published: boolean;
}

/** Columns the project grid needs. Avoids shipping every case study to the homepage. */
export const PROJECT_CARD_COLUMNS =
  "id, created_at, title, slug, description, cover_url, category, published";

export type ProjectCard = Pick<
  Project,
  | "id"
  | "created_at"
  | "title"
  | "slug"
  | "description"
  | "cover_url"
  | "category"
  | "published"
>;

export interface Slide {
  id: string;
  created_at: string;
  image_url: string;
}

export const TIMELINE_KINDS = ["education", "experience", "award"] as const;

export type TimelineKind = (typeof TIMELINE_KINDS)[number];

export interface TimelineEntry {
  id: string;
  created_at: string;
  title: string;
  organization: string;
  description: string | null;
  /** Free text, e.g. "2023" or "Mar 2024 - Present". */
  period: string;
  kind: TimelineKind;
  sort_order: number;
}
