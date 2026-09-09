import type { TimelineEntry, TimelineKind } from "@/lib/types";

const KIND_LABEL: Record<TimelineKind, string> = {
  education: "Education",
  experience: "Experience",
  award: "Award",
};

const KIND_STYLE: Record<TimelineKind, string> = {
  education: "bg-sky-100 text-sky-900",
  experience: "bg-pink-100 text-pink-900",
  award: "bg-amber-100 text-amber-900",
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
      className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-100 scroll-mt-24"
    >
      <div className="max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-gray-700 mb-4">
          My Journey
        </p>
        <h2
          id="journey-heading"
          className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12 leading-tight"
        >
          Education, experience and milestones.
        </h2>

        <ol className="relative border-l-2 border-gray-200 list-none p-0 ml-2">
          {entries.map((entry) => (
            <li key={entry.id} className="relative pl-8 pb-10 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-sky-600"
              />

              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${KIND_STYLE[entry.kind]}`}
                >
                  {KIND_LABEL[entry.kind]}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {entry.period}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900">{entry.title}</h3>
              <p className="text-base font-medium text-gray-700 mb-2">
                {entry.organization}
              </p>

              {entry.description && (
                <p className="text-gray-800 leading-relaxed break-words">
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
