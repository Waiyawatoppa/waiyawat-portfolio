import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAdjacentProjects,
  getProjectBySlug,
  getProjectIndex,
} from "@/lib/projects";
import { site } from "@/lib/site";
import { displayDate } from "@/lib/types";
import ProjectDetail from "@/app/_components/ProjectDetail";
import SiteFooter from "@/app/_components/SiteFooter";
import SiteNav from "@/app/_components/SiteNav";

export const revalidate = 3600;

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#works", label: "Works" },
  { href: "/#contact", label: "Contact" },
];

const OG_LOCALE: Record<"en" | "th", string> = { en: "en_US", th: "th_TH" };

/**
 * Pre-renders the known projects at build time. Unknown slugs still work —
 * they are rendered on demand and then cached.
 */
export async function generateStaticParams() {
  const projects = await getProjectIndex();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  const url = `${site.url}/project/${project.slug}`;
  const published = displayDate(project).toISOString();

  // openGraph.images is intentionally absent: the file-based
  // opengraph-image.tsx beside this page takes precedence and composites the
  // cover itself.
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: url },
    keywords: project.tags?.length ? project.tags : undefined,
    openGraph: {
      type: "article",
      url,
      title: project.title,
      description: project.description,
      locale: OG_LOCALE[project.lang ?? "en"],
      publishedTime: published,
      modifiedTime: project.updated_at ?? published,
      authors: [site.url],
      tags: project.tags?.length ? project.tags : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
    },
  };
}

export default async function ProjectPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const { previous, next } = await getAdjacentProjects(project);

  const url = `${site.url}/project/${project.slug}`;
  const published = displayDate(project).toISOString();

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    description: project.description,
    url,
    mainEntityOfPage: url,
    datePublished: published,
    dateModified: project.updated_at ?? published,
    inLanguage: project.lang ?? "en",
    keywords: project.tags?.length ? project.tags.join(", ") : undefined,
    image: project.cover_url || `${url}/opengraph-image`,
    author: { "@type": "Person", name: site.name, url: site.url },
    publisher: { "@type": "Person", name: site.name, url: site.url },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Works", item: `${site.url}/#works` },
      { "@type": "ListItem", position: 3, name: project.title, item: url },
    ],
  };

  return (
    <>
      <SiteNav links={NAV_LINKS} />
      <main id="main" className="bg-white min-h-dvh">
        {[article, breadcrumbs].map((data, index) => (
          <script
            key={index}
            type="application/ld+json"
            // Serialized from our own database rows, not user input; escaped to
            // prevent a stored "</script>" from closing the tag early.
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(data).replace(/</g, "\\u003c"),
            }}
          />
        ))}

        <div className="max-w-4xl mx-auto px-6 pt-28 pb-4">
          <Link
            href="/#works"
            className="text-sm font-bold text-gray-700 hover:text-sky-700 transition inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 rounded"
          >
            <span aria-hidden="true">←</span> Back to selected works
          </Link>
        </div>

        <div className="max-w-4xl mx-auto pb-16">
          <ProjectDetail
            project={project}
            headingLevel="h1"
            previous={previous}
            next={next}
            stickyTop="top-16"
          />
        </div>

        <SiteFooter />
      </main>
    </>
  );
}
