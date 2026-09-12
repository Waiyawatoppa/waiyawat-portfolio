import { normalizeSlugParam } from "./slug";
import { supabase } from "./supabase";
import {
  PROJECT_CARD_COLUMNS,
  type Project,
  type ProjectCard,
  type Slide,
  type TimelineEntry,
} from "./types";

/**
 * Read-side data access. Uses the anon client, which RLS restricts to SELECT.
 * Every mutation lives in src/app/admin/actions.ts behind the service role.
 */

/**
 * Cards for the homepage grid. Deliberately omits `content`, which can be tens
 * of kilobytes per row, and excludes drafts.
 */
export async function getProjectCards(): Promise<ProjectCard[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_CARD_COLUMNS)
    .eq("published", true)
    .order("project_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load projects:", error.message);
    return [];
  }
  return (data ?? []) as unknown as ProjectCard[];
}

/**
 * Public lookup: drafts resolve to null so an unfinished case study 404s rather
 * than leaking. The admin edit page reads by id instead and is not affected.
 */
export async function getProjectBySlug(rawSlug: string): Promise<Project | null> {
  const slug = normalizeSlugParam(rawSlug);

  // limit(1) rather than maybeSingle(): maybeSingle() returns an error when
  // more than one row matches, which would turn an accidental duplicate slug
  // into an invisible project instead of showing one of them.
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .limit(1);

  if (error) {
    console.error(`Failed to load project "${slug}":`, error.message);
    return null;
  }
  const project = (data?.[0] as Project | undefined) ?? null;
  if (!project) {
    console.warn(`No published project for slug "${slug}" (raw param: "${rawSlug}")`);
  }
  return project;
}

export type ProjectIndexRow = Pick<
  Project,
  "slug" | "title" | "description" | "created_at" | "updated_at" | "project_date"
>;

/** Used by generateStaticParams, the sitemap and the RSS feed. */
export async function getProjectIndex(): Promise<ProjectIndexRow[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("slug, title, description, created_at, updated_at, project_date")
    .eq("published", true)
    .order("project_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load project index:", error.message);
    return [];
  }
  return (data ?? []) as ProjectIndexRow[];
}

export type AdjacentProject = Pick<
  Project,
  "slug" | "title" | "category" | "cover_url"
>;

/**
 * Neighbours in reading order (newest first), so "next" is the older project
 * and "previous" the newer one — matching the direction of the grid.
 */
export async function getAdjacentProjects(
  current: Pick<Project, "project_date" | "created_at">,
): Promise<{ previous: AdjacentProject | null; next: AdjacentProject | null }> {
  const columns = "slug, title, category, cover_url";
  const pivot = current.project_date ?? current.created_at.slice(0, 10);

  const [older, newer] = await Promise.all([
    supabase
      .from("projects")
      .select(columns)
      .eq("published", true)
      .lt("project_date", pivot)
      .order("project_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("projects")
      .select(columns)
      .eq("published", true)
      .gt("project_date", pivot)
      .order("project_date", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    previous: (newer.data as AdjacentProject | null) ?? null,
    next: (older.data as AdjacentProject | null) ?? null,
  };
}

/** Distinct tags across published projects, for filters and editor suggestions. */
export async function getAllTags(includeDrafts = false): Promise<string[]> {
  let query = supabase.from("projects").select("tags");
  if (!includeDrafts) query = query.eq("published", true);

  const { data, error } = await query;
  if (error) {
    console.error("Failed to load tags:", error.message);
    return [];
  }

  const set = new Set<string>();
  for (const row of (data ?? []) as { tags: string[] | null }[]) {
    for (const tag of row.tags ?? []) set.add(tag);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export async function getSlides(): Promise<Slide[]> {
  const { data, error } = await supabase
    .from("about_slides")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load slides:", error.message);
    return [];
  }
  return (data ?? []) as Slide[];
}

export async function getTimeline(): Promise<TimelineEntry[]> {
  const { data, error } = await supabase
    .from("timeline_entries")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load timeline:", error.message);
    return [];
  }
  return (data ?? []) as TimelineEntry[];
}
