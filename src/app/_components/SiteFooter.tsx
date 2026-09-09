import { mailto, site } from "@/lib/site";

const ICON = "w-5 h-5";

function GitHubIcon() {
  return (
    <svg className={ICON} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.1c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.97.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className={ICON} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      className={ICON}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path strokeLinecap="round" d="m2 7 10 6 10-6" />
    </svg>
  );
}

/**
 * Brand-coloured circle with a white glyph — the look react-social-icons gave
 * us originally. Drawn inline instead of pulling the library back in, because
 * the library offered no way to set rel="noopener noreferrer" on its anchor.
 */
const SOCIAL_LINK =
  "w-11 h-11 grid place-items-center rounded-full text-white shadow-sm transition-transform duration-300 hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700";

const BRAND = {
  github: "bg-[#181717]",
  linkedin: "bg-[#0A66C2]",
  email: "bg-sky-600",
} as const;

export default function SiteFooter() {
  return (
    <footer className="py-16 text-center border-t border-gray-200 flex flex-col items-center gap-8">
      <nav aria-label="Social links">
        <ul className="flex justify-center items-center gap-4 list-none p-0">
          <li>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`${SOCIAL_LINK} ${BRAND.github}`}
            >
              <GitHubIcon />
              <span className="sr-only">GitHub (opens in a new tab)</span>
            </a>
          </li>

          {site.linkedin && (
            <li>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={`${SOCIAL_LINK} ${BRAND.linkedin}`}
              >
                <LinkedInIcon />
                <span className="sr-only">LinkedIn (opens in a new tab)</span>
              </a>
            </li>
          )}

          <li>
            <a href={mailto} className={`${SOCIAL_LINK} ${BRAND.email}`}>
              <MailIcon />
              <span className="sr-only">Email {site.email}</span>
            </a>
          </li>
        </ul>
      </nav>

      <p className="text-gray-500 text-sm">
        © {new Date().getFullYear()} {site.name}.
      </p>
    </footer>
  );
}
