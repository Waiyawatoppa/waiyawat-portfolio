import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProjectBySlug, getProjectIndex } from "@/lib/projects";
import { site } from "@/lib/site";
import ProjectDetail from "@/app/_components/ProjectDetail";
import SiteFooter from "@/app/_components/SiteFooter";

export const revalidate = 3600;

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

  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: project.title,
      description: project.description,
      images: project.cover_url ? [{ url: project.cover_url }] : undefined,
      publishedTime: project.created_at,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
      images: project.cover_url ? [project.cover_url] : undefined,
    },
  };
}

export default async function ProjectPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: `${site.url}/project/${project.slug}`,
    dateCreated: project.created_at,
    image: project.cover_url || undefined,
    author: { "@type": "Person", name: site.name, url: site.url },
  };

  return (
    <main className="bg-white min-h-dvh">
      <script
        type="application/ld+json"
        // Serialized from our own database rows, not user input; escaped to
        // prevent a stored "</script>" from closing the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-4">
        <Link
          href="/#works"
          className="text-sm font-bold text-gray-700 hover:text-sky-700 transition inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 rounded"
        >
          <span aria-hidden="true">←</span> Back to selected works
        </Link>
      </div>

      <div className="max-w-4xl mx-auto pb-16">
        <ProjectDetail project={project} headingLevel="h1" />
      </div>

      <SiteFooter />
    </main>
  );
}
