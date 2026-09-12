import { describe, expect, it } from "vitest";

import { isAllowedImageSrc, safeExternalUrl, youtubeId } from "./url";

describe("safeExternalUrl", () => {
  it("accepts http and https", () => {
    expect(safeExternalUrl("https://github.com/x")).toBe("https://github.com/x");
    expect(safeExternalUrl("http://example.com")).toBe("http://example.com");
  });

  it("upgrades a bare domain to https", () => {
    expect(safeExternalUrl("github.com/waiyawatoppa")).toBe(
      "https://github.com/waiyawatoppa",
    );
  });

  it("rejects script-bearing and non-web schemes", () => {
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(safeExternalUrl("data:text/html,<script>")).toBeNull();
    expect(safeExternalUrl("vbscript:msgbox")).toBeNull();
    expect(safeExternalUrl("file:///etc/passwd")).toBeNull();
  });

  it("is not fooled by a scheme that merely starts with http", () => {
    // The old check was value.startsWith("http"), which this would pass.
    expect(safeExternalUrl("httpx://evil")).toBeNull();
  });

  it("treats empty input as no link", () => {
    expect(safeExternalUrl("")).toBeNull();
    expect(safeExternalUrl(null)).toBeNull();
    expect(safeExternalUrl(undefined)).toBeNull();
  });
});

describe("isAllowedImageSrc", () => {
  it("allows this project's public storage host over https", () => {
    expect(
      isAllowedImageSrc(
        "https://testproject.supabase.co/storage/v1/object/public/project-images/x.png",
      ),
    ).toBe(true);
  });

  it("allows site-relative paths", () => {
    expect(isAllowedImageSrc("/placeholder.png")).toBe(true);
  });

  it("rejects other hosts, plain http, and garbage", () => {
    expect(isAllowedImageSrc("https://other.supabase.co/x.png")).toBe(false);
    expect(isAllowedImageSrc("https://evil.example/x.png")).toBe(false);
    expect(isAllowedImageSrc("http://testproject.supabase.co/x.png")).toBe(false);
    expect(isAllowedImageSrc("not a url")).toBe(false);
    expect(isAllowedImageSrc("")).toBe(false);
  });
});

describe("youtubeId", () => {
  it("extracts the id from the common URL shapes", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=10s")).toBe("dQw4w9WgXcQ");
  });

  it("rejects lookalikes, http, and malformed ids", () => {
    expect(youtubeId("https://notyoutube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(youtubeId("http://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(youtubeId("https://www.youtube.com/watch?v=short")).toBeNull();
    expect(youtubeId("https://www.youtube.com/watch?v=<script>")).toBeNull();
    expect(youtubeId("not a url")).toBeNull();
  });
});
