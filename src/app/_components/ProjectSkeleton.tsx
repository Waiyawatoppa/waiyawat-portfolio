/** Placeholder matching ProjectDetail's shape, so navigation feels immediate. */
export default function ProjectSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading project">
      <div className="w-full aspect-[21/9] bg-surface-muted animate-pulse motion-reduce:animate-none" />
      <div className="max-w-2xl mx-auto px-6 md:px-0 py-12 space-y-6">
        <div className="h-5 w-24 rounded-full bg-surface-muted animate-pulse motion-reduce:animate-none" />
        <div className="h-12 w-3/4 rounded-xl bg-surface-muted animate-pulse motion-reduce:animate-none" />
        <div className="h-4 w-40 rounded bg-surface-muted animate-pulse motion-reduce:animate-none" />
        <div className="pt-6 space-y-3">
          <div className="h-4 w-full rounded bg-surface-muted animate-pulse motion-reduce:animate-none" />
          <div className="h-4 w-11/12 rounded bg-surface-muted animate-pulse motion-reduce:animate-none" />
          <div className="h-4 w-4/5 rounded bg-surface-muted animate-pulse motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}
