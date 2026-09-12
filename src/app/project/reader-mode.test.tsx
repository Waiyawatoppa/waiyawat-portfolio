import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ProjectDetail from "@/app/_components/ProjectDetail";
import { site } from "@/lib/site";
import type { Project } from "@/lib/types";

/**
 * Runs the exact library behind Firefox Reader View over the server-rendered
 * project page. If this passes, Reader Mode extracts the article cleanly.
 * Safari and Edge use different implementations but the same signals: a
 * single <article>, a byline, a date, and prose without UI text mixed in.
 */

const FIRST_PARAGRAPH =
  "Smallholder farms in Nakhon Pathom lose a measurable share of yield to late irrigation.";
const LAST_PARAGRAPH =
  "The pilot ran for one growing season and the farmers kept the sensors afterwards.";

const project: Project = {
  id: "p1",
  created_at: "2026-09-01T00:00:00.000Z",
  updated_at: "2026-09-02T00:00:00.000Z",
  project_date: "2024-03-15",
  title: "Smart Irrigation for Smallholder Farms",
  slug: "smart-irrigation",
  description: "An IoT pilot that cut water use by a third on three farms.",
  content: [
    FIRST_PARAGRAPH,
    "",
    "## Background",
    "",
    "Rice and vegetable plots here rely on manual irrigation timed by habit rather than soil condition. That habit is usually right, and occasionally expensive.",
    "",
    "## The Approach",
    "",
    "We placed capacitive soil moisture probes at root depth and fed readings to a microcontroller that opened valves on a schedule the farmer could override from a phone.",
    "",
    "### Constraints",
    "",
    "No mains power at the plots, intermittent mobile signal, and a budget that ruled out commercial controllers.",
    "",
    "## Results",
    "",
    LAST_PARAGRAPH,
  ].join("\n"),
  cover_url: "",
  category: "Technology & Engineering",
  tags: ["iot", "agriculture"],
  lang: "en",
  github_url: "https://github.com/waiyawatoppa/irrigation",
  live_url: null,
  pdf_url: null,
  published: true,
};

function renderPage(): string {
  const body = renderToStaticMarkup(
    <ProjectDetail
      project={project}
      headingLevel="h1"
      previous={{ slug: "a", title: "Earlier Work", category: "Business", cover_url: "" }}
      next={{ slug: "b", title: "Later Work", category: "Leader", cover_url: "" }}
    />,
  );
  const title = site.titleTemplate.replace("%s", project.title);
  return `<!doctype html><html lang="en"><head><title>${title}</title><meta name="author" content="${site.name}"></head><body><main>${body}</main></body></html>`;
}

describe("browser Reader Mode", () => {
  const dom = new JSDOM(renderPage(), { url: `${site.url}/project/${project.slug}` });
  // Readability mutates the document it is given, so it gets a clone and the
  // original stays intact for the structural assertions below.
  const parsed = new Readability(
    dom.window.document.cloneNode(true) as Document,
  ).parse();

  it("recognises the page as an article", () => {
    expect(parsed).not.toBeNull();
  });

  it("uses the project title as the article title", () => {
    expect(parsed?.title).toBe(project.title);
  });

  it("finds the author byline", () => {
    expect(parsed?.byline ?? "").toContain(site.name);
  });

  it("keeps the whole body, first paragraph to last", () => {
    expect(parsed?.textContent).toContain(FIRST_PARAGRAPH);
    expect(parsed?.textContent).toContain(LAST_PARAGRAPH);
    expect(parsed?.textContent).toContain("Constraints");
  });

  it("does not pull reading controls into the prose", () => {
    const text = parsed?.textContent ?? "";
    expect(text).not.toContain("Text size");
    expect(text).not.toContain("Decrease text size");
    expect(text).not.toContain("Hide contents");
  });

  it("reports the language and a published date on the article element", () => {
    const article = dom.window.document.querySelector("article");
    expect(article?.getAttribute("lang")).toBe("en");
    expect(article?.querySelector("time[itemprop='datePublished']")?.getAttribute("datetime")).toBe("2024-03-15");
  });

  it("renders the real project date, not the CMS insertion date", () => {
    const html = dom.serialize();
    expect(html).toContain("March 2024");
    expect(html).not.toContain("September 2026");
  });
});
