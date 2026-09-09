"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { CATEGORIES, TIMELINE_KINDS } from "@/lib/types";

export type ActionState = { ok: boolean; message: string } | null;

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
    .min(1, "Slug is required")
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers and single hyphens",
    ),
  description: z.string().trim().min(1, "Description is required").max(500),
  content: z.string().trim().min(1, "Content is required").max(50_000),
  category: z.enum(CATEGORIES),
  github_url: externalUrl,
  live_url: externalUrl,
  pdf_url: externalUrl,
});

function parseProject(formData: FormData) {
  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    content: formData.get("content"),
    category: formData.get("category"),
    github_url: formData.get("github_url") ?? "",
    live_url: formData.get("live_url") ?? "",
    pdf_url: formData.get("pdf_url") ?? "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(". "));
  }
  return parsed.data;
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

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

function revalidatePublic(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/project/${slug}`);
}

/* ------------------------------------------------------------------ projects */

export async function createProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const project = parseProject(formData);

    const file = formData.get("image_file");
    let coverUrl = "";
    if (file instanceof File && file.size > 0) {
      coverUrl = await uploadImage("project-images", "covers", file);
    }

    const { error } = await getSupabaseAdmin()
      .from("projects")
      .insert([{ ...project, cover_url: coverUrl }]);

    if (error) {
      throw new Error(
        error.code === "23505"
          ? `The slug "${project.slug}" is already used by another project`
          : error.message,
      );
    }

    revalidatePublic(project.slug);
    return { ok: true, message: `Published "${project.title}"` };
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
  } catch (error) {
    return { ok: false, message: toMessage(error) };
  }

  // Outside the try block: redirect throws a control-flow signal that must not
  // be swallowed by the catch above.
  redirect("/admin");
}

export async function deleteProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const id = String(formData.get("id") ?? "");
    if (!id) throw new Error("Missing project id");

    const { error } = await getSupabaseAdmin().from("projects").delete().eq("id", id);
    if (error) throw new Error(error.message);

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
