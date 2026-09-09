/**
 * Single place for the site's identity and outbound links.
 *
 * Anything set to `null` is omitted from the UI rather than rendered as a dead
 * link — the previous version shipped `href="#"` placeholders for the resume
 * and email, so the only contact affordance on the site went nowhere.
 */
export const site = {
  name: "Waiyawat Aphiraktanon",
  shortName: "Waiyawat",
  role: "Computer Science student at Kasetsart University",
  title: "Waiyawat Aphiraktanon — Portfolio",
  description:
    "Computer Science student at Kasetsart University, building technology that bridges business strategy and positive social impact.",

  /**
   * Canonical origin. Set NEXT_PUBLIC_SITE_URL in the deploy environment;
   * metadataBase, the sitemap, robots.txt and OG image URLs all derive from it.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  email: "work.waiyawat@gmail.com",

  github: "https://github.com/waiyawatoppa",

  /**
   * TODO(waiyawat): replace with your actual profile URL, e.g.
   * "https://www.linkedin.com/in/your-handle". Left null so the icon is
   * hidden rather than linking to LinkedIn's homepage.
   */
  linkedin: null as string | null,

  /**
   * TODO(waiyawat): drop your CV at public/waiyawat-aphiraktanon-cv.pdf and
   * set this to "/waiyawat-aphiraktanon-cv.pdf". Left null so the CV buttons
   * are hidden until the file exists.
   */
  cv: null as string | null,
} as const;

export const mailto = `mailto:${site.email}`;
