import { describe, expect, it } from "vitest";

import {
  createIdFactory,
  extractHeadings,
  readingTimeMinutes,
  slugifyHeading,
} from "./markdown";

describe("slugifyHeading", () => {
  it("lowercases and hyphenates Latin text", () => {
    expect(slugifyHeading("The Problem")).toBe("the-problem");
    expect(slugifyHeading("  Results & Impact  ")).toBe("results-impact");
  });

  it("keeps Thai vowels and tone marks (they are combining marks, not letters)", () => {
    expect(slugifyHeading("แนวทางแก้ปัญหา")).toBe("แนวทางแก้ปัญหา");
    expect(slugifyHeading("ผลลัพธ์ที่ได้")).toBe("ผลลัพธ์ที่ได้");
  });

  it("never returns an empty id", () => {
    expect(slugifyHeading("!!!")).toBe("section");
    expect(slugifyHeading("")).toBe("section");
  });
});

describe("createIdFactory", () => {
  it("disambiguates repeated headings in document order", () => {
    const next = createIdFactory();
    expect(next("Background")).toBe("background");
    expect(next("Other")).toBe("other");
    expect(next("Background")).toBe("background-1");
    expect(next("Background")).toBe("background-2");
  });
});

describe("extractHeadings", () => {
  const doc = [
    "Intro.",
    "## Background",
    "## The Problem",
    "### Constraints",
    "## Background",
    "```bash",
    "## not a heading",
    "```",
    "## Results **bold** and [a link](https://x.com)",
    "# Top level is ignored",
    "#### Too deep is ignored",
  ].join("\n");

  it("returns H2/H3 only, with ids matching the renderer's factory", () => {
    const headings = extractHeadings(doc);
    expect(headings.map((h) => h.id)).toEqual([
      "background",
      "the-problem",
      "constraints",
      "background-1",
      "results-bold-and-a-link",
    ]);
    expect(headings.map((h) => h.level)).toEqual([2, 2, 3, 2, 2]);
  });

  it("skips headings inside fenced code blocks", () => {
    expect(extractHeadings(doc).some((h) => h.text.includes("not a heading"))).toBe(false);
  });

  it("strips inline markdown from the contents label", () => {
    const last = extractHeadings(doc).at(-1);
    expect(last?.text).toBe("Results bold and a link");
  });

  it("handles empty input", () => {
    expect(extractHeadings("")).toEqual([]);
  });
});

describe("readingTimeMinutes", () => {
  it("never reports less than one minute", () => {
    expect(readingTimeMinutes("")).toBe(1);
    expect(readingTimeMinutes("short")).toBe(1);
  });

  it("scales with length", () => {
    const long = "word ".repeat(1000);
    expect(readingTimeMinutes(long)).toBeGreaterThanOrEqual(5);
  });

  it("estimates Thai, which has no word spaces, by character count", () => {
    const thai = "ก".repeat(3000);
    expect(readingTimeMinutes(thai)).toBeGreaterThanOrEqual(3);
  });
});
