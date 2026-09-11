"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { compressFileInput } from "@/lib/compress-image";
import { clearDraft } from "@/lib/draft-storage";
import { slugifyTitle } from "@/lib/slug";
import { CATEGORIES, PROJECT_LANGS, type Project } from "@/lib/types";
import MarkdownEditor from "./MarkdownEditor";
import { createProject, updateProject, type ActionState } from "./actions";

const FIELD =
  "p-3 bg-surface-raised rounded-xl border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent";
const LABEL = "text-xs font-bold uppercase text-ink-muted";

const LANG_LABEL: Record<(typeof PROJECT_LANGS)[number], string> = {
  en: "English",
  th: "ไทย",
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminForm({
  initialData,
  allTags = [],
}: {
  initialData?: Partial<Project> & { id?: string };
  /** Existing tags across projects, offered as suggestions. */
  allTags?: string[];
}) {
  const isEdit = Boolean(initialData?.id);
  const draftKey = `project:${initialData?.id ?? "new"}`;

  // The action itself enforces authorization and validation; this component
  // only renders whatever it reports back.
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isEdit ? updateProject : createProject,
    null,
  );

  // Title and slug are controlled so the slug can follow the title until the
  // author edits it directly. Existing projects never auto-change their slug:
  // that would break every link already shared.
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);

  function onTitleChange(next: string) {
    setTitle(next);
    if (!slugTouched) setSlug(slugifyTitle(next));
  }

  // A successful save makes the autosaved draft redundant. This synchronises
  // external storage with the action result; it does not set React state.
  useEffect(() => {
    if (state?.ok) clearDraft(draftKey);
  }, [state, draftKey]);

  return (
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {isEdit && (
        <>
          <input type="hidden" name="id" defaultValue={initialData?.id} />
          <input
            type="hidden"
            name="cover_url"
            defaultValue={initialData?.cover_url ?? ""}
          />
        </>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="title" className={LABEL}>
          Title
        </label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          required
          maxLength={200}
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="slug" className={LABEL}>
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          required
          maxLength={120}
          aria-describedby="slug-hint"
          className={`${FIELD} font-mono text-sm`}
        />
        <p id="slug-hint" className="text-xs text-ink-muted">
          {isEdit
            ? "This is the page URL. Changing it breaks links already shared."
            : "Follows the title until you edit it. Letters, numbers and hyphens."}
        </p>
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <label htmlFor="description" className={LABEL}>
          Short Description
        </label>
        <input
          id="description"
          name="description"
          defaultValue={initialData?.description}
          required
          maxLength={500}
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <label htmlFor="content" className={LABEL}>
          Full Content
        </label>
        <MarkdownEditor
          name="content"
          defaultValue={initialData?.content ?? ""}
          draftKey={draftKey}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="project_date" className={LABEL}>
          Project Date
        </label>
        <input
          id="project_date"
          name="project_date"
          type="date"
          defaultValue={initialData?.project_date ?? today()}
          required
          aria-describedby="date-hint"
          className={FIELD}
        />
        <p id="date-hint" className="text-xs text-ink-muted">
          When the work happened, not when you added it. Shown as month and
          year, and used for ordering.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="category" className={LABEL}>
          Category
        </label>
        <select
          id="category"
          name="category"
          defaultValue={initialData?.category ?? CATEGORIES[0]}
          className={FIELD}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="tags" className={LABEL}>
          Tags (Optional)
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={initialData?.tags?.join(", ") ?? ""}
          list="tag-suggestions"
          placeholder="react, iot, business-model"
          aria-describedby="tags-hint"
          className={FIELD}
        />
        <datalist id="tag-suggestions">
          {allTags.map((tag) => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
        <p id="tags-hint" className="text-xs text-ink-muted">
          Comma-separated, up to 10.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="lang" className={LABEL}>
          Language
        </label>
        <select
          id="lang"
          name="lang"
          defaultValue={initialData?.lang ?? "en"}
          aria-describedby="lang-hint"
          className={FIELD}
        >
          {PROJECT_LANGS.map((lang) => (
            <option key={lang} value={lang}>
              {LANG_LABEL[lang]}
            </option>
          ))}
        </select>
        <p id="lang-hint" className="text-xs text-ink-muted">
          Tells browsers and screen readers which language the post is in.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="image_file" className={LABEL}>
          {isEdit ? "Replace Cover Image" : "Cover Image"}
        </label>
        <input
          id="image_file"
          type="file"
          name="image_file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          aria-describedby="image-hint"
          onChange={(event) => void compressFileInput(event.currentTarget)}
          className="text-xs"
        />
        <p id="image-hint" className="text-xs text-ink-muted">
          JPEG, PNG, WebP, AVIF or GIF, up to 5MB.
          {isEdit ? " Leave empty to keep the current cover." : ""}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="github_url" className={LABEL}>
          GitHub URL (Optional)
        </label>
        <input
          id="github_url"
          name="github_url"
          defaultValue={initialData?.github_url ?? ""}
          placeholder="https://github.com/..."
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="live_url" className={LABEL}>
          Live Website URL (Optional)
        </label>
        <input
          id="live_url"
          name="live_url"
          defaultValue={initialData?.live_url ?? ""}
          placeholder="https://..."
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <label htmlFor="pdf_url" className={LABEL}>
          PDF / Google Drive URL (Optional)
        </label>
        <input
          id="pdf_url"
          name="pdf_url"
          defaultValue={initialData?.pdf_url ?? ""}
          placeholder="https://drive.google.com/file/d/..."
          className={FIELD}
        />
      </div>

      {state && (
        <p
          role="status"
          aria-live="polite"
          className={`md:col-span-2 rounded-xl px-4 py-3 text-sm font-medium ${
            state.ok
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-line bg-surface-raised px-4 py-3">
        <input
          id="published"
          type="checkbox"
          name="published"
          defaultChecked={initialData?.published ?? true}
          className="w-4 h-4 accent-sky-600"
        />
        <label htmlFor="published" className="text-sm text-ink-secondary">
          <span className="font-bold">Published</span>
          <span className="text-ink-muted">
            {" "}
            — unchecked keeps it as a draft, hidden from the site, the sitemap
            and search engines.
          </span>
        </label>
      </div>

      <div className="md:col-span-2 flex flex-wrap items-center gap-4 mt-2">
        <button
          type="submit"
          disabled={pending}
          className={`flex-1 min-w-48 py-4 rounded-2xl font-bold transition text-white disabled:opacity-60 ${
            isEdit ? "bg-sky-700 hover:bg-sky-800" : "bg-gray-900 hover:bg-ink/90"
          }`}
        >
          {pending ? "Saving..." : isEdit ? "Save Changes" : "Publish Project"}
        </button>
        {isEdit && (
          <Link
            href="/admin"
            className="text-sm font-bold text-ink-secondary hover:text-accent-strong transition rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ← Back to dashboard
          </Link>
        )}
      </div>
    </form>
  );
}
