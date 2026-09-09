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
      lastModified: project.created_at
        ? new Date(project.created_at)
        : new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
