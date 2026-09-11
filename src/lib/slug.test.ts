import { describe, expect, it } from "vitest";

import { SLUG_PATTERN, slugifyTitle } from "./slug";

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
