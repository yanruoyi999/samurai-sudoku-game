import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("next.config.js", "utf8");

describe("PWA puzzle data caching", () => {
  it("does not cache the mutable puzzle index with the dated puzzle CacheFirst rule", () => {
    expect(source).toContain("urlPattern: /\\/puzzles\\/index\\.json$/i");
    expect(source).toMatch(
      /urlPattern: \/\\\/puzzles\\\/index\\\.json\$\/i,[\s\S]*?handler: 'NetworkFirst'/,
    );
    expect(source).toMatch(
      /urlPattern: \/\\\/puzzles\\\/\\d\{4\}\\\/\\d\{4\}-\\d\{2\}-\\d\{2\}\\\.json\$\/i,[\s\S]*?handler: 'CacheFirst'/,
    );
    expect(source).not.toContain("urlPattern: /\\/puzzles\\/.*/i");
  });
});
