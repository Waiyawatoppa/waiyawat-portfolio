import { getAdjacentProjects, getProjectBySlug } from "@/lib/projects";
import Modal from "@/app/_components/Modal";
import ProjectDetail from "@/app/_components/ProjectDetail";

const TITLE_ID = "project-modal-title";

// Deliberately dynamic. Caching an intercepted parallel-route segment meant a
// "not found" result (e.g. opened while still a draft) could be served for an
// hour after publishing. The full page at /project/[slug] carries the ISR.

/**
 * Intercepting route for soft navigations from the project grid.
 *
 * A Server Component, so the content arrives with the navigation instead of
 * the client fetching it after hydration. Links to neighbouring projects
 * re-trigger this same route, so prev/next swap content inside the dialog.
 */
export default async function ProjectModal(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  // Say so rather than rendering nothing: an empty slot leaves the visitor on
  // the homepage with a /project URL and no idea what happened.
  if (!project) {
    return (
      <Modal titleId={TITLE_ID}>
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-ink-muted mb-4">
            Not found
          </p>
          <h2 id={TITLE_ID} className="text-3xl font-bold text-ink mb-4">
            This project isn&rsquo;t available.
          </h2>
          <p className="text-ink-secondary">
            It may be unpublished or the link may be out of date.
          </p>
        </div>
      </Modal>
    );
  }

  const { previous, next } = await getAdjacentProjects(project);

  return (
    <Modal titleId={TITLE_ID}>
      <ProjectDetail
        project={project}
        headingLevel="h2"
        titleId={TITLE_ID}
        previous={previous}
        next={next}
      />
    </Modal>
  );
}
