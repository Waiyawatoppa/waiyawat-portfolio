import AboutSlider from "./AboutSlider";
import Journey from "./Journey";
import ProjectGrid from "./ProjectGrid";
import TechStack from "./TechStack";
import SiteFooter from "./_components/SiteFooter";
import SiteNav, { type NavLink } from "./_components/SiteNav";
import { getProjectCards, getSlides, getTimeline } from "@/lib/projects";
import { mailto, site } from "@/lib/site";

/**
 * Revalidated rather than dynamic. The old version awaited auth() here purely
 * to decide whether to show an admin bar, which forced a session read plus two
 * Supabase round trips on every anonymous visit. Sign-in now lives at
 * /admin/login, so this page can be cached for everyone.
 */
export const revalidate = 3600;

/** The Journey link is only offered when there is a Journey section to reach. */
function navLinks(hasJourney: boolean): NavLink[] {
  return [
    { href: "/#about", label: "About" },
    ...(hasJourney ? [{ href: "/#journey", label: "Journey" }] : []),
    { href: "/#works", label: "Works" },
    { href: "/#contact", label: "Contact" },
  ];
}

const EYEBROW = "text-xs uppercase tracking-[0.3em] font-bold text-gray-700";

export default async function Home() {
  const [projects, slides, timeline] = await Promise.all([
    getProjectCards(),
    getSlides(),
    getTimeline(),
  ]);

  return (
    <>
      <SiteNav links={navLinks(timeline.length > 0)} />

      <main id="main" className="bg-white min-h-dvh">
        <section className="pt-36 pb-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight max-w-4xl mx-auto">
              Bridging{" "}
              <span className="bg-gradient-to-r from-sky-600 to-pink-600 bg-clip-text text-transparent">
                Business Strategy
              </span>{" "}
              with Technology.
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed">
              {site.name} — {site.role}. Focused on building tech solutions for
              positive social impact.
            </p>
            <div className="flex justify-center gap-4" aria-hidden="true">
              <span className="h-1 w-20 bg-sky-600 rounded-full" />
              <span className="h-1 w-20 bg-pink-600 rounded-full" />
            </div>
          </div>
        </section>

        <section
          id="about"
          aria-labelledby="about-heading"
          className="max-w-6xl mx-auto px-6 py-16 mb-10 border-t border-gray-100 scroll-mt-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="w-full">
              <AboutSlider initialSlides={slides} />
            </div>

            <div>
              <p className={`${EYEBROW} mb-4`}>About Me</p>
              <h2
                id="about-heading"
                className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight"
              >
                Technology Creating{" "}
                <span className="text-sky-700">Positive Impact</span> for{" "}
                <span className="text-pink-700">Business and Society</span>.
              </h2>

              <div className="space-y-5 text-gray-800 leading-relaxed text-base">
                <p>
                  Hi, I&rsquo;m{" "}
                  <span className="font-semibold text-gray-900">
                    {site.shortName}
                  </span>
                  , a Computer Science student at Kasetsart University. With a
                  deep passion for engineering, technology and social
                  enterprise, I have dedicated my journey since childhood to
                  exploring how innovation can transform the world.
                </p>
                <p>
                  I am committed to continuous self-improvement, balancing my
                  expertise across technology, engineering and business. I
                  believe I can be a{" "}
                  <span className="font-semibold text-gray-900">
                    key piece of the puzzle
                  </span>{" "}
                  for modern enterprises, driving them forward with stability
                  and sustainability through the integration of advanced
                  technology and strategic management.
                </p>
                <p>
                  Thank you for visiting my profile. I look forward to the
                  possibility of collaborating with you in the future.
                </p>
                <p className="font-bold text-gray-900 pt-2">{site.name}</p>
              </div>

              {site.cv && (
                <div className="mt-10">
                  <a
                    href={site.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-sky-700 transition shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                  >
                    View my CV
                    <span className="sr-only">
                      {" "}
                      (PDF, opens in a new tab)
                    </span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        <Journey entries={timeline} />

        <TechStack />

        <section
          id="works"
          aria-labelledby="works-heading"
          className="max-w-6xl mx-auto px-6 py-16 scroll-mt-24"
        >
          <h2 id="works-heading" className={`${EYEBROW} mb-12 text-center`}>
            Selected Works
          </h2>
          <ProjectGrid projects={projects} />
        </section>

        <section
          id="contact"
          aria-labelledby="contact-heading"
          className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-100 scroll-mt-24"
        >
          <div className="max-w-2xl mx-auto text-center">
            <p className={`${EYEBROW} mb-4`}>Contact</p>
            <h2
              id="contact-heading"
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Let&rsquo;s build something worth building.
            </h2>
            <p className="text-gray-800 leading-relaxed mb-10">
              I&rsquo;m open to internships, collaborations and conversations
              about technology, business and social impact. The fastest way to
              reach me is email.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={mailto}
                className="px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-sky-700 transition shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
              >
                {site.email}
              </a>
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 border border-gray-300 rounded-full text-sm font-bold text-gray-900 hover:bg-gray-50 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
              >
                GitHub
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              {site.linkedin && (
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 border border-gray-300 rounded-full text-sm font-bold text-gray-900 hover:bg-gray-50 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                >
                  LinkedIn
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}
