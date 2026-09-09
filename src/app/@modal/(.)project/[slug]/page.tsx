import { getProjectBySlug } from "@/lib/projects";
import Modal from "@/app/_components/Modal";
import ProjectDetail from "@/app/_components/ProjectDetail";

const TITLE_ID = "project-modal-title";

/**
 * Intercepting route for soft navigations from the project grid.
 *
 * This is a Server Component, so the content arrives with the navigation
 * instead of the client fetching it after hydration behind a spinner. The full
 * page at /project/[slug] renders the same component for direct hits.
 */
export default async function ProjectModal(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  // Fall through to the full route rather than showing an empty dialog.
  if (!project) return null;

  return (
    <Modal titleId={TITLE_ID}>
      <ProjectDetail
        project={project}
        headingLevel="h2"
        titleId={TITLE_ID}
      />
    </Modal>
  );
}
