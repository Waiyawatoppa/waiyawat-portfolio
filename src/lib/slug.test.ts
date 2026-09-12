import { describe, expect, it } from "vitest";

import { normalizeSlugParam, SLUG_PATTERN, slugifyTitle } from "./slug";

describe("slugifyTitle", () => {
  it("folds Latin diacritics and hyphenates", () => {
    expect(slugifyTitle("Café Ordering System")).toBe("cafe-ordering-system");
    expect(slugifyTitle("  IoT: Smart Farm v2!  ")).toBe("iot-smart-farm-v2");
  });

  it("keeps Thai readable rather than transliterating", () => {
    expect(slugifyTitle("ระบบจัดการฟาร์ม")).toBe("ระบบจัดการฟาร์ม");
  });

  it("produces something the server will accept", () => {
    for (const title of ["Hello World", "Café", "ระบบจัดการฟาร์ม", "A--B", "x"]) {
      const slug = slugifyTitle(title);
      expect(slug).toMatch(SLUG_PATTERN);
    }
  });

  it("caps length without leaving a trailing hyphen", () => {
    const slug = slugifyTitle("word ".repeat(60));
    expect(slug.length).toBeLessThanOrEqual(120);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("normalizeSlugParam", () => {
  it("decodes a percent-encoded Thai slug to match what is stored", () => {
    const stored = slugifyTitle("ระบบจัดการฟาร์ม");
    expect(normalizeSlugParam(encodeURIComponent(stored))).toBe(stored);
  });

  it("is a no-op on an already-decoded or plain ASCII slug", () => {
    expect(normalizeSlugParam("ระบบจัดการฟาร์ม")).toBe("ระบบจัดการฟาร์ม");
    expect(normalizeSlugParam("smart-farm")).toBe("smart-farm");
  });

  it("lowercases and trims, matching the server-side slug schema", () => {
    expect(normalizeSlugParam("  Smart-Farm ")).toBe("smart-farm");
  });

  it("survives a malformed percent sequence instead of throwing", () => {
    expect(normalizeSlugParam("bad%E0%A4%A")).toBe("bad%e0%a4%a");
  });
});
