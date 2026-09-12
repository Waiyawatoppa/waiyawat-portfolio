import Modal from "@/app/_components/Modal";
import ProjectSkeleton from "@/app/_components/ProjectSkeleton";

export default function Loading() {
  return (
    <Modal titleId="project-modal-title">
      <ProjectSkeleton />
    </Modal>
  );
}
