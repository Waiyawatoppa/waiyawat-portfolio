"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import type { Project } from "@/lib/types";
import ConfirmDelete from "./ConfirmDelete";
import { deleteProject, togglePublished, type ActionState } from "./actions";

export type ProjectRow = Pick<
  Project,
  "id" | "title" | "slug" | "category" | "published" | "created_at" | "project_date"
>;

type Filter = "all" | "published" | "draft";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

function PublishToggle({ project }: { project: ProjectRow }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    togglePublished,
    null,
  );

  return (
    <form action={formAction} className="contents">
      <input type="hidden" name="id" value={project.id} />
      <input
        type="hidden"
        name="next"
        value={project.published ? "false" : "true"}
      />
      <button
        type="submit"
        disabled={pending}
        title={
          project.published ? "Move back to drafts" : "Publish to the live site"
        }
        className="text-xs font-bold text-gray-700 hover:text-sky-800 transition p-2 hover:bg-sky-50 rounded-lg disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
      >
        {pending ? "…" : project.published ? "Unpublish" : "Publish"}
        <span className="sr-only"> {project.title}</span>
      </button>
      {state && !state.ok && (
        <span role="alert" className="text-xs text-red-700">
          {state.message}
        </span>
      )}
    </form>
  );
}

export default function ProjectList({ projects }: { projects: ProjectRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((project) => {
      if (filter === "published" && !project.published) return false;
      if (filter === "draft" && project.published) return false;
      if (!needle) return true;
      return (
        project.title.toLowerCase().includes(needle) ||
        project.slug.toLowerCase().includes(needle) ||
        project.category.toLowerCase().includes(needle)
      );
    });
  }, [projects, query, filter]);

  const draftCount = projects.filter((p) => !p.published).length;

  return (
    <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">Existing Projects</h2>
          <p className="text-xs text-gray-600">
            {projects.length} total
            {draftCount > 0 && ` · ${draftCount} draft${draftCount > 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="project-search" className="sr-only">
            Search projects
          </label>
          <input
            id="project-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, slug or category"
            className="p-2 px-3 w-56 bg-gray-50 rounded-xl border border-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          />

          <div role="group" aria-label="Filter by status" className="flex gap-1">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={filter === option.value}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
                  filter === option.value
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="space-y-4 list-none p-0">
        {visible.map((project) => (
          <li
            key={project.id}
            className={`flex flex-wrap items-center justify-between gap-4 p-4 border rounded-2xl ${
              project.published
                ? "border-gray-200"
                : "border-dashed border-amber-300 bg-amber-50/40"
            }`}
          >
            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate flex items-center gap-2">
                {project.title}
                {!project.published && (
                  <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full shrink-0">
                    Draft
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-600 truncate">
                /project/{project.slug}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full uppercase font-bold tracking-wide">
                {project.category}
              </span>
              <div className="flex items-center gap-1">
                {project.published && (
                  <Link
                    href={`/project/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-gray-700 hover:text-sky-800 transition p-2 hover:bg-sky-50 rounded-lg"
                  >
                    View
                    <span className="sr-only">
                      {" "}
                      {project.title} (opens in a new tab)
                    </span>
                  </Link>
                )}
                <PublishToggle project={project} />
                <Link
                  href={`/admin/edit/${project.id}`}
                  className="text-xs font-bold text-gray-700 hover:text-sky-800 transition p-2 hover:bg-sky-50 rounded-lg"
                >
                  Edit
                  <span className="sr-only"> {project.title}</span>
                </Link>
                <ConfirmDelete
                  action={deleteProject}
                  fields={{ id: project.id }}
                  itemLabel={project.title}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {visible.length === 0 && (
        <p className="text-center py-10 text-gray-600 text-sm">
          {projects.length === 0
            ? "No projects yet. Add your first one above."
            : "No projects match this search."}
        </p>
      )}
    </section>
  );
}
