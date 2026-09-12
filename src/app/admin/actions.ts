"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SLUG_PATTERN } from "@/lib/slug";
import { CATEGORIES, PROJECT_LANGS, TIMELINE_KINDS } from "@/lib/types";

export type ActionState = {
  ok: boolean;
  message: string;
  /** Set by createProject so the form can move to the edit page. */
  id?: string;
} | null;

/* ---------------------------------------------------------------- validation */

/**
 * Accepts a bare domain and upgrades it to https. Rejects every scheme other
 * than http/https, which is what keeps `javascript:` and `data:` payloads out
 * of the anchor hrefs on the project detail page.
 */
const externalUrl = z
  .string()
  .trim()
  .transform((value) => {
    if (value === "") return "";
    return /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  })
  .refine((value) => {
    if (value === "") return true;
    try {
      const { protocol } = new URL(value);
      return protocol === "https:" || protocol === "http:";
    } catch {
      return false;
    }
  }, "Must be a valid http(s) URL")
  .transform((value) => (value === "" ? null : value));

const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .max(120)
    .regex(
      SLUG_PATTERN,
      "Slug must be letters, numbers and single hyphens",
    ),
  description: z.string().trim().min(1, "Description is required").max(500),
  content: z.string().trim().min(1, "Content is required").max(50_000),
  category: z.enum(CATEGORIES),
  project_date: z.iso.date("Project date must be a valid date"),
  lang: z.enum(PROJECT_LANGS),
  tags: z
    .string()
    .transform((raw) =>
      Array.from(
        new Set(
          raw
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean),
        ),
      ),
    )
    .refine((tags) => tags.length <= 10, "Use at most 10 tags")
    .refine(
      (tags) => tags.every((tag) => tag.length <= 30),
      "Each tag must be 30 characters or fewer",
    ),
  github_url: externalUrl,
  live_url: externalUrl,
  pdf_url: externalUrl,
});

function parseProject(formData: FormData) {
  const published = formData.get("published") !== null;

  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    content: formData.get("content"),
    category: formData.get("category"),
    project_date: formData.get("project_date"),
    lang: formData.get("lang") ?? "en",
    tags: formData.get("tags") ?? "",
    github_url: formData.get("github_url") ?? "",
    live_url: formData.get("live_url") ?? "",
    pdf_url: formData.get("pdf_url") ?? "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(". "));
  }
  return { ...parsed.data, published };
}

/* ------------------------------------------------------------------- uploads */

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * SVG is deliberately excluded: it can carry script, and files served from the
 * Supabase storage origin would execute there.
 */
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/**
 * The accept attribute on the file input is a client-side hint only, so the
 * real check happens here. The extension is derived from the reported MIME
 * type rather than the supplied filename, so a ".html" name cannot smuggle an
 * executable path into the bucket.
 */
async function uploadImage(
  bucket: string,
  folder: string,
  file: File,
): Promise<string> {
  if (file.size === 0) throw new Error("The selected file is empty");
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(
      `Image must be ${MAX_IMAGE_BYTES / 1024 / 1024}MB or smaller`,
    );
  }

  const extension = IMAGE_EXTENSIONS[file.type];
  if (!extension) {
    throw new Error(
      `Unsupported image type. Use JPEG, PNG, WebP, AVIF or GIF.`,
    );
  }

  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await getSupabaseAdmin().storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  return getSupabaseAdmin().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/**
 * Extracts object paths for every public URL in `text` that points at the
 * given bucket on this project, so they can be passed to storage.remove().
 * Plain string scanning rather than a dynamically built regex, so the base
 * URL never needs escaping.
 */
function storagePathsIn(bucket: string, text: string): string[] {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return [];

  const prefix = `${base.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/`;
  const found = new Set<string>();

  let index = text.indexOf(prefix);
  while (index !== -1) {
    const start = index + prefix.length;
    const match = text.slice(start).match(/^[^\s)"'<>]+/);
    if (match) found.add(decodeURIComponent(match[0]));
    index = text.indexOf(prefix, start);
  }

  return Array.from(found);
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

function revalidatePublic(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  if (slug) {
    revalidatePath(`/project/${slug}`);
    revalidatePath(`/project/${encodeURIComponent(slug)}`);
  }
  // Layout-level flush of every project page: covers renames, duplicates
  // and any encoding mismatch between the stored slug and the request path.
  revalidatePath("/project/[slug]", "page");
}

/* ------------------------------------------------------------------ projects */

export async function createProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const project = parseProject(formData);

    // Normal path: the form uploaded the cover on selection and sends its URL.
    // Fallback (JS off): a raw file arrives and is uploaded here instead.
    let coverUrl = String(formData.get("cover_url") ?? "");
    const file = formData.get("image_file");
    if (file instanceof File && file.size > 0) {
      coverUrl = await uploadImage("project-images", "covers", file);
    }

    const { data, error } = await getSupabaseAdmin()
      .from("projects")
      .insert([{ ...project, cover_url: coverUrl }])
      .select("id")
      .single();

    if (error) {
      throw new Error(
        error.code === "23505"
          ? `The slug "${project.slug}" is already used by another project`
          : error.message,
      );
    }

    revalidatePublic(project.slug);
    return {
      ok: true,
      id: data.id as string,
      message: project.published
        ? `Published "${project.title}"`
        : `Saved "${project.title}" as a draft`,
    };
  } catch (error) {
    return { ok: false, message: toMessage(error) };
  }
}

export async function updateProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const id = String(formData.get("id") ?? "");
    if (!id) throw new Error("Missing project id");

    const project = parseProject(formData);
    const existingCover = String(formData.get("cover_url") ?? "");

    const file = formData.get("image_file");
    let coverUrl = existingCover;
    if (file instanceof File && file.size > 0) {
      // Any upload failure throws, so we never silently keep the old cover
      // while reporting success.
      coverUrl = await uploadImage("project-images", "covers", file);
    }

    const { error } = await getSupabaseAdmin()
      .from("projects")
      .update({ ...project, cover_url: coverUrl })
      .eq("id", id);

    if (error) {
      throw new Error(
        error.code === "23505"
          ? `The slug "${project.slug}" is already used by another project`
          : error.message,
      );
    }

    revalidatePublic(project.slug);
    revalidatePath(`/admin/edit/${id}`);
    return { ok: true, message: "Saved" };
  } catch (error) {
    return { ok: false, message: toMessage(error) };
  }
}

export async function deleteProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const id = String(formData.get("id") ?? "");
    if (!id) throw new Error("Missing project id");

    const admin = getSupabaseAdmin();

    // Read before delete so the cover and any inline images can be removed
    // from storage. Best-effort: a failed cleanup must not resurrect the row.
    const { data: row } = await admin
      .from("projects")
      .select("cover_url, content")
      .eq("id", id)
      .maybeSingle();

    const { error } = await admin.from("projects").delete().eq("id", id);
    if (error) throw new Error(error.message);

    if (row) {
      const paths = storagePathsIn(
        "project-images",
        `${row.cover_url ?? ""}
${row.content ?? ""}`,
      );
      if (paths.length > 0) {
        const { error: removeError } = await admin.storage
          .from("project-images")
          .remove(paths);
        if (removeError) {
          console.error("Orphaned images not removed:", removeError.message);
        }
      }
    }

    revalidatePublic();
    return { ok: true, message: "Project deleted" };
  } catch (error) {
    return { ok: false, message: toMessage(error) };
  }
}

/* -------------------------------------------------------------- about slides */

export async function createSlide(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const file = formData.get("image_file");
    if (!(file instanceof File) || file.size === 0) {
      throw new Error("Choose an image to upload");
    }

    const imageUrl = await uploadImage("about-images", "slides", file);

    const { error } = await getSupabaseAdmin()
      .from("about_slides")
      .insert([{ image_url: imageUrl }]);
    if (error) throw new Error(error.message);

    revalidatePublic();
    return { ok: true, message: "Slide added" };
  } catch (error) {
    return { ok: false, message: toMessage(error) };
  }
}

export async function deleteSlide(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const id = String(formData.get("id") ?? "");
    const imageUrl = String(formData.get("image_url") ?? "");
    if (!id) throw new Error("Missing slide id");

    const { error } = await getSupabaseAdmin()
      .from("about_slides")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);

    // Best effort: the row is gone either way, so a failed storage cleanup
    // should not surface to the user as a failed delete.
    const marker = "/about-images/";
    const index = imageUrl.indexOf(marker);
    if (index !== -1) {
      const path = imageUrl.slice(index + marker.length);
      await getSupabaseAdmin().storage.from("about-images").remove([path]);
    }

    revalidatePublic();
    return { ok: true, message: "Slide removed" };
  } catch (error) {
    return { ok: false, message: toMessage(error) };
  }
}

/* ----------------------------------------------------------- timeline ----- */

const timelineSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  organization: z.string().trim().min(1, "Organization is required").max(200),
  period: z.string().trim().min(1, "Period is required").max(80),
  description: z.string().trim().max(1000).optional().default(""),
  kind: z.enum(TIMELINE_KINDS),
  sort_order: z.coerce.number().int().min(-9999).max(9999).default(0),
});

export async function createTimelineEntry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const parsed = timelineSchema.safeParse({
      title: formData.get("title"),
      organization: formData.get("organization"),
      period: formData.get("period"),
      description: formData.get("description") ?? "",
      kind: formData.get("kind"),
      sort_order: formData.get("sort_order") || 0,
    });

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues.map((issue) => issue.message).join(". "),
      );
    }

    const { description, ...rest } = parsed.data;
    const { error } = await getSupabaseAdmin()
      .from("timeline_entries")
      .insert([{ ...rest, description: description || null }]);
    if (error) throw new Error(error.message);

    revalidatePublic();
    return { ok: true, message: `Added "${parsed.data.title}"` };
  } catch (error) {
    return { ok: false, message: toMessage(error) };
  }
}

export async function updateTimelineEntry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const id = String(formData.get("id") ?? "");
    if (!id) throw new Error("Missing entry id");

    const parsed = timelineSchema.safeParse({
      title: formData.get("title"),
      organization: formData.get("organization"),
      period: formData.get("period"),
      description: formData.get("description") ?? "",
      kind: formData.get("kind"),
      sort_order: formData.get("sort_order") || 0,
    });

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues.map((issue) => issue.message).join(". "),
      );
    }

    const { description, ...rest } = parsed.data;
    const { error } = await getSupabaseAdmin()
      .from("timeline_entries")
      .update({ ...rest, description: description || null })
      .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePublic();
    return { ok: true, message: "Saved" };
  } catch (error) {
    return { ok: false, message: toMessage(error) };
  }
}

export async function deleteTimelineEntry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const id = String(formData.get("id") ?? "");
    if (!id) throw new Error("Missing entry id");

    const { error } = await getSupabaseAdmin()
      .from("timeline_entries")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePublic();
    return { ok: true, message: "Entry removed" };
  } catch (error) {
    return { ok: false, message: toMessage(error) };
  }
}

/**
 * Uploads an image for insertion into the markdown body and hands back its
 * public URL. Called directly from the editor rather than through a form, so
 * it returns the URL instead of an ActionState.
 *
 * Authorization, MIME allowlist and size cap are the same as every other
 * upload — see uploadImage above.
 */
export async function uploadContentImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  try {
    await requireAdmin();

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new Error("Choose an image to upload");
    }

    const url = await uploadImage("project-images", "content", file);
    return { ok: true, url };
  } catch (error) {
    return { ok: false, message: toMessage(error) };
  }
}

/**
 * Uploads a cover as soon as it is chosen, so the URL can live in the form and
 * in the autosaved draft. Without this, a cover picked before a reload was
 * simply gone: browsers never restore <input type="file">.
 */
export async function uploadCoverImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  try {
    await requireAdmin();

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new Error("Choose an image to upload");
    }

    const url = await uploadImage("project-images", "covers", file);
    return { ok: true, url };
  } catch (error) {
    return { ok: false, message: toMessage(error) };
  }
}

/** Flip a project between draft and published from the dashboard list. */
export async function togglePublished(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const id = String(formData.get("id") ?? "");
    if (!id) throw new Error("Missing project id");
    const next = formData.get("next") === "true";

    const { data, error } = await getSupabaseAdmin()
      .from("projects")
      .update({ published: next })
      .eq("id", id)
      .select("slug")
      .maybeSingle();
    if (error) throw new Error(error.message);

    // The project's own page must be invalidated too: a 404 cached while it
    // was a draft would otherwise persist for the full revalidate window.
    revalidatePublic(data?.slug ?? undefined);
    return { ok: true, message: next ? "Published" : "Moved to drafts" };
  } catch (error) {
    return { ok: false, message: toMessage(error) };
  }
}
