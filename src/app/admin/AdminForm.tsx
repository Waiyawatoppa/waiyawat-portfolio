"use client";

import { useActionState } from "react";

import { CATEGORIES, type Project } from "@/lib/types";
import { createProject, updateProject, type ActionState } from "./actions";

const FIELD =
  "p-3 bg-gray-50 rounded-xl border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:border-sky-600";
const LABEL = "text-xs font-bold uppercase text-gray-600";

export default function AdminForm({
  initialData,
}: {
  initialData?: Partial<Project> & { id?: string };
}) {
  const isEdit = Boolean(initialData?.id);

  // The action itself enforces authorization and validation; this component
  // only renders whatever it reports back.
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isEdit ? updateProject : createProject,
    null,
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
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
          defaultValue={initialData?.title}
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
          defaultValue={initialData?.slug}
          required
          maxLength={120}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          aria-describedby="slug-hint"
          className={FIELD}
        />
        <p id="slug-hint" className="text-xs text-gray-600">
          Lowercase letters, numbers and single hyphens. This becomes the page
          URL, so changing it breaks existing links.
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
        <textarea
          id="content"
          name="content"
          defaultValue={initialData?.content}
          rows={8}
          required
          maxLength={50000}
          className={FIELD}
        />
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
          className="text-xs"
        />
        <p id="image-hint" className="text-xs text-gray-600">
          JPEG, PNG, WebP, AVIF or GIF, up to 5MB.
          {isEdit ? " Leave empty to keep the current cover." : ""}
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

      <button
        type="submit"
        disabled={pending}
        className={`md:col-span-2 py-4 rounded-2xl font-bold transition text-white mt-2 disabled:opacity-60 ${
          isEdit ? "bg-sky-700 hover:bg-sky-800" : "bg-gray-900 hover:bg-black"
        }`}
      >
        {pending
          ? "Saving..."
          : isEdit
            ? "Update Project"
            : "Publish Project"}
      </button>
    </form>
  );
}
