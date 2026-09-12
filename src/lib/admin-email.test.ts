import { afterEach, describe, expect, it } from "vitest";

import { isAdminEmail, normalizeEmail } from "./admin-email";

const ORIGINAL = process.env.ADMIN_EMAIL;

afterEach(() => {
  process.env.ADMIN_EMAIL = ORIGINAL;
});

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Owner@Example.TEST ")).toBe("owner@example.test");
  });

  it("applies NFKC so full-width and compatibility forms collapse", () => {
    // Full-width Latin letters normalise to ASCII under NFKC.
    expect(normalizeEmail("ｏｗｎｅｒ@example.test")).toBe("owner@example.test");
  });
});

describe("isAdminEmail", () => {
  it("matches the configured admin regardless of case", () => {
    process.env.ADMIN_EMAIL = "owner@example.test";
    expect(isAdminEmail("OWNER@example.test")).toBe(true);
  });

  it("rejects everyone else", () => {
    process.env.ADMIN_EMAIL = "owner@example.test";
    expect(isAdminEmail("owner@example.tests")).toBe(false);
    expect(isAdminEmail("attacker@example.test")).toBe(false);
  });

  it("fails closed when either side is missing", () => {
    process.env.ADMIN_EMAIL = "owner@example.test";
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail("")).toBe(false);

    delete process.env.ADMIN_EMAIL;
    expect(isAdminEmail("owner@example.test")).toBe(false);
  });
});
