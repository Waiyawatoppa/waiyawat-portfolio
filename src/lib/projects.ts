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

/** Cards for the homepage grid. Deliberately omits `content`, which can be tens of kilobytes per row. */
export async function getProjectCards(): Promise<ProjectCard[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_CARD_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load projects:", error.message);
    return [];
  }
  return (data ?? []) as unknown as ProjectCard[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Failed to load project "${slug}":`, error.message);
    return null;
  }
  return (data as Project) ?? null;
}

/** Used by generateStaticParams and the sitemap. */
export async function getProjectIndex(): Promise<
  Pick<Project, "slug" | "created_at">[]
> {
  const { data, error } = await supabase
    .from("projects")
    .select("slug, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load project index:", error.message);
    return [];
  }
  return (data ?? []) as Pick<Project, "slug" | "created_at">[];
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
