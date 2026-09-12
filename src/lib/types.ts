export const CATEGORIES = [
  "Tech + Biz",
  "Business",
  "Technology & Engineering",
  "Leader",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PROJECT_LANGS = ["en", "th"] as const;
export type ProjectLang = (typeof PROJECT_LANGS)[number];

export interface Project {
  id: string;
  /** When the row was entered into the CMS. Not the date shown to readers. */
  created_at: string;
  /** Maintained by a database trigger; drives dateModified and sitemap lastmod. */
  updated_at: string;
  /**
   * When the work actually happened (ISO date, day precision). Displayed as
   * month + year and used for ordering. Falls back to created_at for rows that
   * predate the column.
   */
  project_date: string | null;
  title: string;
  slug: string;
  description: string;
  content: string;
  cover_url: string;
  category: string;
  tags: string[];
  lang: ProjectLang;
  github_url?: string | null;
  live_url?: string | null;
  pdf_url?: string | null;
  /** Drafts are hidden from the public site, sitemap and static params. */
  published: boolean;
}

/** Columns the project grid needs. Avoids shipping every case study to the homepage. */
export const PROJECT_CARD_COLUMNS =
  "id, created_at, updated_at, project_date, title, slug, description, cover_url, category, tags, lang, published";

export type ProjectCard = Pick<
  Project,
  | "id"
  | "created_at"
  | "updated_at"
  | "project_date"
  | "title"
  | "slug"
  | "description"
  | "cover_url"
  | "category"
  | "tags"
  | "lang"
  | "published"
>;

/** The date readers see. */
export function displayDate(project: Pick<Project, "project_date" | "created_at">): Date {
  return new Date(project.project_date ?? project.created_at);
}

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
