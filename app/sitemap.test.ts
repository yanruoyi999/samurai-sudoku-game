import { describe, expect, it } from "vitest";

import { getPuzzleIndex } from "@/lib/puzzles";
import type { Difficulty } from "@/lib/sudoku/types";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("uses each difficulty archive's newest puzzle date as lastModified", async () => {
    const entries = await sitemap();
    const index = await getPuzzleIndex();
    const difficulties: Difficulty[] = ["easy", "medium", "hard", "evil"];

    for (const difficulty of difficulties) {
      const latestPuzzleId = index.puzzles
        .filter((puzzle) => puzzle.difficulty === difficulty)
        .reduce<string | undefined>(
          (latest, puzzle) => (!latest || puzzle.id > latest ? puzzle.id : latest),
          undefined,
        );
      const entry = entries.find(
        (item) =>
          item.url ===
          `https://www.samuraisudoku.net/en/games/samurai/difficulty/${difficulty}`,
      );

      expect(latestPuzzleId).toBeDefined();
      expect(entry?.lastModified).toBeInstanceOf(Date);
      expect((entry?.lastModified as Date).toISOString()).toBe(
        new Date(`${latestPuzzleId}T00:00:00.000Z`).toISOString(),
      );
    }
  });

  it("includes high-intent long-tail guide pages", async () => {
    const entries = await sitemap();
    const urls = new Set(entries.map((entry) => entry.url));

    expect(urls.has("https://www.samuraisudoku.net/en/games/samurai/common-mistakes")).toBe(true);
    expect(urls.has("https://www.samuraisudoku.net/zh/games/samurai/common-mistakes")).toBe(true);
    expect(urls.has("https://www.samuraisudoku.net/en/games/samurai/printable-practice-plan")).toBe(true);
    expect(urls.has("https://www.samuraisudoku.net/zh/games/samurai/printable-practice-plan")).toBe(true);
  });

  it("uses printable-samurai-sudoku as the canonical printable resource page", async () => {
    const entries = await sitemap();
    const urls = new Set(entries.map((entry) => entry.url));

    expect(urls.has("https://www.samuraisudoku.net/en/printable-samurai-sudoku")).toBe(true);
    expect(urls.has("https://www.samuraisudoku.net/zh/printable-samurai-sudoku")).toBe(true);
    expect(urls.has("https://www.samuraisudoku.net/en/games/samurai/printable")).toBe(false);
    expect(urls.has("https://www.samuraisudoku.net/zh/games/samurai/printable")).toBe(false);
    expect(urls.has("https://www.samuraisudoku.net/en/games/samurai/pdf")).toBe(false);
    expect(urls.has("https://www.samuraisudoku.net/zh/games/samurai/pdf")).toBe(false);
    expect(urls.has("https://www.samuraisudoku.net/en/games/samurai/pdf/sample")).toBe(false);
    expect(urls.has("https://www.samuraisudoku.net/zh/games/samurai/pdf/sample")).toBe(false);
  });

  it("keeps low-search-intent trust pages out of the XML sitemap", async () => {
    const entries = await sitemap();
    const urls = new Set(entries.map((entry) => entry.url));

    for (const locale of ["en", "zh"]) {
      expect(urls.has(`https://www.samuraisudoku.net/${locale}/about`)).toBe(false);
      expect(urls.has(`https://www.samuraisudoku.net/${locale}/contact`)).toBe(false);
      expect(urls.has(`https://www.samuraisudoku.net/${locale}/privacy`)).toBe(false);
      expect(urls.has(`https://www.samuraisudoku.net/${locale}/support`)).toBe(false);
      expect(urls.has(`https://www.samuraisudoku.net/${locale}/terms`)).toBe(false);
    }
  });
});
