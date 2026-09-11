import Link from "next/link";

import SiteFooter from "./_components/SiteFooter";
import SiteNav from "./_components/SiteNav";

const LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#works", label: "Works" },
  { href: "/#contact", label: "Contact" },
];

export const metadata = { title: "Page not found" };

/**
 * Branded 404. A visitor here most likely followed an old link to a project
 * whose slug changed, so the way forward is the work itself, not a bare error.
 */
export default function NotFound() {
  return (
    <>
      <SiteNav links={LINKS} />
      <main id="main" className="bg-surface min-h-dvh flex flex-col">
        <section className="flex-1 grid place-items-center px-6 pt-36 pb-20">
          <div className="max-w-xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-ink-muted mb-4">
              404
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-ink mb-6 leading-tight">
              That page isn&rsquo;t here.
            </h1>
            <p className="text-lg text-ink-muted leading-relaxed mb-10">
              The link may be out of date, or the project may have moved. The
              work is all still here.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/#works"
                className="px-8 py-3 bg-ink text-surface rounded-full text-sm font-bold hover:bg-sky-700 transition shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                See selected works
              </Link>
              <Link
                href="/"
                className="px-8 py-3 border border-line-strong rounded-full text-sm font-bold text-ink hover:bg-surface-raised transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
        <SiteFooter />
      </main>
    </>
  );
}
