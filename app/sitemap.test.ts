import { describe, expect, it } from "vitest";

import sitemap from "./sitemap";

describe("sitemap", () => {
  it("uses each difficulty archive's newest puzzle date as lastModified", async () => {
    const entries = await sitemap();
    const expectedDates = {
      easy: "2026-07-11T00:00:00.000Z",
      medium: "2026-07-08T00:00:00.000Z",
      hard: "2026-07-09T00:00:00.000Z",
      evil: "2026-07-10T00:00:00.000Z",
    };

    for (const [difficulty, expectedDate] of Object.entries(expectedDates)) {
      const entry = entries.find(
        (item) =>
          item.url ===
          `https://www.samuraisudoku.net/en/games/samurai/difficulty/${difficulty}`,
      );

      expect(entry?.lastModified).toBeInstanceOf(Date);
      expect((entry?.lastModified as Date).toISOString()).toBe(expectedDate);
    }
  });
});
