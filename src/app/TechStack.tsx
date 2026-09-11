const SKILLS = [
  "Next.js",
  "Tailwind CSS",
  "Microcontroller",
  "C/C++",
  "Java",
  "Business Intelligence",
  "Python",
  "Figma",
  "DaVinci Resolve",
  "Git",
];

/**
 * Server Component: this is a static list animated purely by CSS, so there is
 * nothing to hydrate. The pause control is a CSS-only checkbox toggle (styled
 * in globals.css) rather than React state, which keeps it that way while still
 * providing the stop mechanism WCAG 2.2.2 requires.
 *
 * The input, label and .marquee must remain siblings — the pause rules use the
 * general sibling combinator.
 */
function Track({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      className="flex shrink-0 justify-around min-w-full animate-infinite-scroll list-none p-0"
      aria-hidden={duplicate}
    >
      {SKILLS.map((skill) => (
        <li key={skill} className="flex items-center gap-6 px-6 md:px-8">
          <span className="text-sm md:text-base font-bold text-ink-secondary uppercase tracking-widest whitespace-nowrap">
            {skill}
          </span>
          <span className="text-sky-400 text-xs" aria-hidden="true">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function TechStack() {
  return (
    <section
      id="tech-stack"
      aria-labelledby="tech-stack-heading"
      className="py-10 scroll-mt-24"
    >
      <h2
        id="tech-stack-heading"
        className="text-xs uppercase tracking-[0.3em] font-bold text-ink-secondary mb-8 text-center"
      >
        Tech Stack and Skills
      </h2>

      <input type="checkbox" id="pause-marquee" className="marquee-pause" />
      <label htmlFor="pause-marquee" className="marquee-toggle">
        <span className="marquee-label-pause">Pause animation</span>
        <span className="marquee-label-resume">Resume animation</span>
      </label>

      <div className="marquee w-full overflow-hidden bg-surface py-8 border-y border-line flex md:[mask-image:linear-gradient(to_right,transparent_0,black_80px,black_calc(100%-80px),transparent_100%)]">
        <Track />
        <Track duplicate />
      </div>
    </section>
  );
}
