import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Markdown from "./Markdown";

const render = (content: string) =>
  renderToStaticMarkup(<Markdown content={content} />);

describe("Markdown", () => {
  it("gives headings ids that match the table of contents", () => {
    const html = render("## Background\n\ntext\n\n## Background\n\n### แนวทางแก้ปัญหา");
    expect(html).toContain('id="background"');
    expect(html).toContain('id="background-1"');
    expect(html).toContain('id="แนวทางแก้ปัญหา"');
  });

  it("renders raw HTML in the source as escaped text, never as markup", () => {
    const html = render('Hello <script>alert(1)</script> <img src=x onerror=alert(1)>');
    // No element is created from the source…
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    // …the characters are still there, but entity-escaped as visible text.
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("drops links with unsafe schemes but keeps their text", () => {
    const html = render("[click](javascript:alert(1)) and [ok](https://example.com)");
    expect(html).not.toContain("javascript:");
    expect(html).toContain("click");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("renders images only from the allowed storage host", () => {
    const ok = render(
      "![Diagram](https://testproject.supabase.co/storage/v1/object/public/project-images/a.png)",
    );
    expect(ok).toContain("<img");
    expect(ok).toContain("Diagram");

    const bad = render("![x](https://evil.example/tracker.png)");
    expect(bad).not.toContain("<img");
    expect(bad).not.toContain("evil.example");
  });

  it("keeps single newlines as line breaks for legacy plain-text posts", () => {
    const html = render("line one\nline two");
    expect(html).toContain("<br");
  });

  it("renders GFM tables inside a scroll container", () => {
    const html = render("| a | b |\n|---|---|\n| 1 | 2 |");
    expect(html).toContain("<table");
    expect(html).toContain("overflow-x-auto");
  });
});
