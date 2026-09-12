import type { MetadataRoute } from "next";

import { getProjectIndex } from "@/lib/projects";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjectIndex();

  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${site.url}/project/${project.slug}`,
      lastModified: new Date(project.updated_at ?? project.created_at),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
