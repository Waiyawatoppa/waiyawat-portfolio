import { getAdjacentProjects, getProjectBySlug } from "@/lib/projects";
import Modal from "@/app/_components/Modal";
import ProjectDetail from "@/app/_components/ProjectDetail";

const TITLE_ID = "project-modal-title";

// Cached like the full page. revalidatePublic() in the admin actions
// invalidates /project/[slug], which covers this intercepted route too.
export const revalidate = 3600;

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

  // Fall through to the full route rather than showing an empty dialog.
  if (!project) return null;

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
