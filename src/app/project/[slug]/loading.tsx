import ProjectSkeleton from "@/app/_components/ProjectSkeleton";

export default function Loading() {
  return (
    <main className="bg-white min-h-dvh">
      <div className="max-w-4xl mx-auto pt-28 pb-16">
        <ProjectSkeleton />
      </div>
    </main>
  );
}
