import { getProjectIndex } from "@/lib/projects";
import { site } from "@/lib/site";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS 2.0 of published projects, newest first. */
export async function GET() {
  const projects = await getProjectIndex();

  const items = projects
    .map((project) => {
      const url = `${site.url}/project/${project.slug}`;
      const date = new Date(project.project_date ?? project.created_at);
      return [
        "    <item>",
        `      <title>${escapeXml(project.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${date.toUTCString()}</pubDate>`,
        `      <description>${escapeXml(project.description)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const lastBuild = projects[0]
    ? new Date(projects[0].updated_at ?? projects[0].created_at)
    : new Date();

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(site.name)} — Projects</title>`,
    `    <link>${site.url}</link>`,
    `    <description>${escapeXml(site.description)}</description>`,
    "    <language>en</language>",
    `    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
