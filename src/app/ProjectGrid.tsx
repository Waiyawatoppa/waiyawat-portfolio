"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CATEGORIES, displayDate, type ProjectCard } from "@/lib/types";
import CoverImage from "./_components/CoverImage";

const FILTERS = ["All", ...CATEGORIES] as const;

/**
 * Bright fill with dark same-hue text, rather than white on a mid-tone fill.
 *
 * White text forces the fill dark enough to carry it, which caps how bright the
 * badge can be. Inverting the polarity lifts the fill from ~50% to ~75% oklch
 * lightness *and* improves contrast at the same time:
 *
 *   white on sky-700  #0069a8  50% lightness  5.85:1
 *   sky-950 on sky-400 #00bcff 75% lightness  6.37:1
 *
 * Measured: sky 6.37:1, pink 5.47:1, orange 6.58:1, emerald 7.83:1.
 */
const CATEGORY_STYLES: Record<string, string> = {
  "tech + biz": "bg-sky-400 text-sky-950",
  business: "bg-pink-400 text-pink-950",
  "technology & engineering": "bg-orange-400 text-orange-950",
  leader: "bg-emerald-400 text-emerald-950",
};

function categoryStyle(category: string) {
  return CATEGORY_STYLES[category?.toLowerCase()] ?? "bg-gray-200 text-gray-900";
}

export default function ProjectGrid({ projects }: { projects: ProjectCard[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const project of projects) for (const tag of project.tags ?? []) set.add(tag);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filtered = projects.filter((project) => {
    if (
      activeCategory !== "All" &&
      project.category?.toLowerCase() !== activeCategory.toLowerCase()
    ) {
      return false;
    }
    if (activeTag && !(project.tags ?? []).includes(activeTag)) return false;
    return true;
  });

  return (
    <div className="w-full">
      <div
        role="group"
        aria-label="Filter projects by category"
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        {FILTERS.map((category) => {
          const active = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={active}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
                active
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {allTags.length > 0 && (
        <div
          role="group"
          aria-label="Filter projects by tag"
          className="flex flex-wrap justify-center gap-2 -mt-6 mb-12"
        >
          {allTags.map((tag) => {
            const active = activeTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(active ? null : tag)}
                aria-pressed={active}
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
                  active
                    ? "bg-sky-400 text-sky-950"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-sky-400 hover:text-sky-900"
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 list-none p-0">
        {filtered.map((project, index) => (
          <li key={project.id}>
            <Link
              href={`/project/${project.slug}`}
              className="group block h-full overflow-hidden bg-white rounded-3xl border border-gray-200 shadow-sm transition-[transform,box-shadow] duration-500 hover:-translate-y-2 hover:shadow-2xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            >
              <div className="aspect-[16/10] overflow-hidden bg-gray-50 relative">
                <CoverImage
                  src={project.cover_url}
                  alt={project.title}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index < 2}
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>

              <div className="p-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className={`text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow-sm ${categoryStyle(project.category)}`}
                  >
                    {project.category || "Project"}
                  </span>
                  <time
                    dateTime={displayDate(project).toISOString().slice(0, 10)}
                    className="text-xs text-gray-500"
                  >
                    {displayDate(project).toLocaleDateString("en-GB", {
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>

                {project.tags?.length > 0 && (
                  <p className="flex flex-wrap gap-1.5 mb-4">
                    {project.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full tracking-wide"
                      >
                        #{tag}
                      </span>
                    ))}
                  </p>
                )}

                <h3 className="text-3xl font-bold mb-3 tracking-tight text-gray-900 group-hover:text-sky-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-500 text-base mb-8 leading-relaxed line-clamp-2">
                  {project.description}
                </p>
                <span className="text-gray-900 text-sm font-bold inline-flex items-center gap-2">
                  View project{" "}
                  <span aria-hidden="true" className="text-lg">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="py-20 text-center text-gray-500 italic text-lg border-2 border-dashed border-gray-200 rounded-3xl">
          {projects.length === 0
            ? "No projects published yet."
            : activeTag
              ? `No projects tagged #${activeTag} here.`
              : "No projects in this category."}
        </p>
      )}
    </div>
  );
}
