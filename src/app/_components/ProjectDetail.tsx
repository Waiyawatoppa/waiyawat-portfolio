import Link from "next/link";

import { extractHeadings, readingTimeMinutes } from "@/lib/markdown";
import type { AdjacentProject } from "@/lib/projects";
import { site } from "@/lib/site";
import { displayDate, type Project } from "@/lib/types";
import { safeExternalUrl } from "@/lib/url";
import CoverImage from "./CoverImage";
import Markdown from "./Markdown";
import ReadingPane from "./ReadingPane";

const LINK_BASE =
  "px-6 py-2 rounded-full text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700";

const LOCALE: Record<Project["lang"], string> = { en: "en-GB", th: "th-TH" };

function NeighbourCard({
  project,
  direction,
}: {
  project: AdjacentProject;
  direction: "previous" | "next";
}) {
  const isNext = direction === "next";
  return (
    <Link
      href={`/project/${project.slug}`}
      className={`group flex flex-col gap-2 rounded-2xl border border-gray-200 p-5 hover:border-sky-400 hover:bg-sky-50/40 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
        isNext ? "text-right items-end" : ""
      }`}
    >
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
        {isNext ? "Next project →" : "← Previous project"}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-sky-900 bg-sky-100 px-2 py-0.5 rounded-full">
        {project.category}
      </span>
      <span className="font-bold text-gray-900 group-hover:text-sky-800 leading-snug">
        {project.title}
      </span>
    </Link>
  );
}

/**
 * The article for a project, shared by the full page at /project/[slug] and
 * the intercepting modal. Server-rendered in both cases.
 *
 * Structured for browser Reader Mode: everything inside <article> is content
 * (cover, header with byline and date, body, related links). The reading
 * controls live in ReadingPane *beside* the article, never inside it, so
 * Readability does not pick up "Text size" or "Contents" as prose.
 *
 * `headingLevel` exists because the modal renders over the homepage, which
 * already has an h1.
 */
export default function ProjectDetail({
  project,
  headingLevel = "h1",
  titleId,
  previous = null,
  next = null,
  stickyTop,
}: {
  project: Project;
  headingLevel?: "h1" | "h2";
  titleId?: string;
  previous?: AdjacentProject | null;
  next?: AdjacentProject | null;
  stickyTop?: string;
}) {
  const Heading = headingLevel;

  const github = safeExternalUrl(project.github_url);
  const live = safeExternalUrl(project.live_url);
  const pdf = safeExternalUrl(project.pdf_url);

  const content = project.content ?? "";
  const headings = extractHeadings(content);
  const minutes = readingTimeMinutes(content);
  const date = displayDate(project);
  const lang = project.lang ?? "en";

  return (
    <ReadingPane headings={headings} stickyTop={stickyTop}>
      <article
        lang={lang}
        itemScope
        itemType="https://schema.org/Article"
        className="font-serif text-gray-700"
      >
        <div className="w-full aspect-[21/9] bg-gray-100 overflow-hidden relative">
          <CoverImage
            src={project.cover_url}
            alt={`Cover image for ${project.title}`}
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>

        <div className="max-w-2xl mx-auto px-6 md:px-0 py-12">
          <header className="font-sans mb-8 border-b border-gray-200 pb-8">
            <p className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold bg-sky-400 text-sky-950 px-3 py-1 rounded-full uppercase tracking-widest">
                {project.category}
              </span>
              {project.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full tracking-wide"
                >
                  #{tag}
                </span>
              ))}
            </p>

            <Heading
              id={titleId}
              itemProp="headline"
              className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900 leading-tight text-balance"
            >
              {project.title}
            </Heading>

            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
              <address className="not-italic inline">
                <a
                  rel="author"
                  href={site.url}
                  itemProp="author"
                  className="font-medium text-gray-700 hover:text-sky-800 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                >
                  {site.name}
                </a>
              </address>
              <span aria-hidden="true">•</span>
              <time
                dateTime={date.toISOString().slice(0, 10)}
                itemProp="datePublished"
              >
                {date.toLocaleDateString(LOCALE[lang], {
                  month: "long",
                  year: "numeric",
                })}
              </time>
              <span aria-hidden="true">•</span>
              <span>{minutes} min read</span>
            </p>
          </header>

          <div itemProp="articleBody" className="break-words">
            <p className="font-sans font-semibold text-[1.15em] text-gray-900 italic border-l-4 border-gray-200 pl-6 my-6">
              {project.description}
            </p>

            {content.trim() ? (
              <Markdown content={content} />
            ) : (
              <p className="my-6 text-gray-500 italic">
                The full write-up for this project is still being written.
              </p>
            )}
          </div>

          {(github || live || pdf) && (
            <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap items-center gap-4 font-sans">
              {github && (
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${LINK_BASE} border border-gray-300 hover:bg-gray-50`}
                >
                  GitHub Repository
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}

              {live && (
                <a
                  href={live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${LINK_BASE} bg-gray-900 text-white hover:bg-gray-800 shadow-lg`}
                >
                  Visit Live Site
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}

              {pdf && (
                <a
                  href={pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${LINK_BASE} inline-flex items-center gap-2 bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-900 hover:text-white`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Read the full document
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
          )}

          {(previous || next) && (
            <nav
              aria-label="More projects"
              className="mt-12 pt-8 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans"
            >
              <div>
                {previous && (
                  <NeighbourCard project={previous} direction="previous" />
                )}
              </div>
              <div>{next && <NeighbourCard project={next} direction="next" />}</div>
            </nav>
          )}
        </div>
      </article>
    </ReadingPane>
  );
}
