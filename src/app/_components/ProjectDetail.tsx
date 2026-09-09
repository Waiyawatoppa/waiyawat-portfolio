import type { Project } from "@/lib/types";
import { safeExternalUrl } from "@/lib/url";
import CoverImage from "./CoverImage";

const LINK_BASE =
  "px-6 py-2 rounded-full text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700";

/**
 * The article body for a project, shared by the full page at /project/[slug]
 * and the intercepting modal. Rendered on the server in both cases, so the
 * content is present in the HTML for crawlers and for users without JS.
 *
 * `headingLevel` exists because the modal renders over the homepage, which
 * already has an h1 — two h1s in one document breaks the outline.
 */
export default function ProjectDetail({
  project,
  headingLevel = "h1",
  titleId,
}: {
  project: Project;
  headingLevel?: "h1" | "h2";
  titleId?: string;
}) {
  const Heading = headingLevel;

  const github = safeExternalUrl(project.github_url);
  const live = safeExternalUrl(project.live_url);
  const pdf = safeExternalUrl(project.pdf_url);

  const published = project.created_at
    ? new Date(project.created_at)
    : null;

  return (
    <>
      <div className="w-full aspect-[21/9] bg-gray-100 overflow-hidden relative">
        <CoverImage
          src={project.cover_url}
          alt={`Cover image for ${project.title}`}
          sizes="(max-width: 896px) 100vw, 896px"
          priority
        />
      </div>

      <article className="max-w-2xl mx-auto px-6 md:px-0 py-12">
        <header className="mb-10 border-b border-gray-200 pb-8">
          <p className="mb-4">
            <span className="text-xs font-bold bg-sky-100 text-sky-900 px-3 py-1 rounded-full uppercase tracking-widest">
              {project.category}
            </span>
          </p>
          <Heading
            id={titleId}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900 leading-tight"
          >
            {project.title}
          </Heading>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700">
            {published && (
              <>
                <time dateTime={published.toISOString()}>
                  {published.toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                <span aria-hidden="true">•</span>
              </>
            )}
            <span>Case Study</span>
          </p>
        </header>

        <div className="text-lg text-gray-800 space-y-8 leading-relaxed">
          <p className="font-semibold text-xl text-gray-900 border-l-4 border-sky-600 pl-6">
            {project.description}
          </p>

          {/* Arbitrary stored text: break long tokens so a pasted URL cannot
              push the layout sideways. */}
          <div className="whitespace-pre-wrap break-words leading-loose">
            {project.content}
          </div>

          {(github || live || pdf) && (
            <div className="pt-10 flex flex-wrap items-center gap-4">
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
        </div>
      </article>
    </>
  );
}
