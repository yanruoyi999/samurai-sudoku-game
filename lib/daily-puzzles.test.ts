import { describe, expect, it } from "vitest";

import type { PuzzleMetadata } from "@/lib/sudoku/types";

import { selectRecentDailyPuzzles } from "./daily-puzzles";

function puzzle(id: string): PuzzleMetadata {
  return {
    id,
    difficulty: "medium",
    estimatedTime: 45,
    checksum: id,
    tags: [],
  };
}

describe("selectRecentDailyPuzzles", () => {
  it("returns the newest dated puzzles without mutating the index", () => {
    const source = [puzzle("2026-07-12"), puzzle("2026-07-14"), puzzle("2026-07-13")];
    const originalOrder = source.map((item) => item.id);

    const result = selectRecentDailyPuzzles(source, 2);

    expect(result.map((item) => item.id)).toEqual(["2026-07-14", "2026-07-13"]);
    expect(source.map((item) => item.id)).toEqual(originalOrder);
  });
});
