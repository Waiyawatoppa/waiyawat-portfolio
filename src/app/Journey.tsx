import type { TimelineEntry, TimelineKind } from "@/lib/types";

const KIND_LABEL: Record<TimelineKind, string> = {
  education: "Education",
  experience: "Experience",
  award: "Award",
};

/** Same bright-fill/dark-text treatment as the project badges. */
const KIND_STYLE: Record<TimelineKind, string> = {
  education: "bg-sky-400 text-sky-950",
  experience: "bg-pink-400 text-pink-950",
  award: "bg-amber-400 text-amber-950",
};

/**
 * Server Component. Renders nothing at all when there are no entries, so the
 * nav link and section never appear as an empty shell before the content
 * exists.
 */
export default function Journey({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section
      id="journey"
      aria-labelledby="journey-heading"
      className="max-w-6xl mx-auto px-6 py-16 border-t border-line scroll-mt-24"
    >
      <div className="max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-ink-secondary mb-4">
          My Journey
        </p>
        <h2
          id="journey-heading"
          className="text-3xl lg:text-4xl font-bold text-ink mb-12 leading-tight"
        >
          Education, experience and milestones.
        </h2>

        <ol className="relative border-l-2 border-line list-none p-0 ml-2">
          {entries.map((entry) => (
            <li key={entry.id} className="relative pl-8 pb-10 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-surface border-2 border-sky-500"
              />

              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${KIND_STYLE[entry.kind]}`}
                >
                  {KIND_LABEL[entry.kind]}
                </span>
                <span className="text-sm font-medium text-ink-secondary">
                  {entry.period}
                </span>
              </div>

              <h3 className="text-xl font-bold text-ink">{entry.title}</h3>
              <p className="text-base font-medium text-ink-secondary mb-2">
                {entry.organization}
              </p>

              {entry.description && (
                <p className="text-ink-secondary leading-relaxed break-words">
                  {entry.description}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
