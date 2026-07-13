import { describe, expect, it } from "vitest";

import { PRINTABLE_STARTER_DIFFICULTIES, selectPrintableStarterPack } from "./printable-pack";
import type { PuzzleMetadata } from "./sudoku/types";

function puzzle(id: string, difficulty: PuzzleMetadata["difficulty"]): PuzzleMetadata {
  return {
    id,
    difficulty,
    estimatedTime: 30,
    checksum: `${id}-${difficulty}`,
    tags: [],
  };
}

describe("selectPrintableStarterPack", () => {
  it("selects five puzzles from each printable starter difficulty", () => {
    const puzzles = PRINTABLE_STARTER_DIFFICULTIES.flatMap((difficulty, difficultyIndex) =>
      Array.from({ length: 7 }, (_, index) =>
        puzzle(`2026-0${difficultyIndex + 1}-${String(index + 1).padStart(2, "0")}`, difficulty),
      ),
    );

    const selected = selectPrintableStarterPack(puzzles);

    expect(selected).toHaveLength(20);
    for (const difficulty of PRINTABLE_STARTER_DIFFICULTIES) {
      expect(selected.filter((item) => item.difficulty === difficulty)).toHaveLength(5);
    }
  });

  it("does not invent missing printable puzzles", () => {
    const selected = selectPrintableStarterPack([
      puzzle("2026-01-01", "easy"),
      puzzle("2026-01-02", "medium"),
      puzzle("2026-01-03", "hard"),
      puzzle("2026-01-04", "evil"),
    ]);

    expect(selected.map((item) => item.id)).toEqual([
      "2026-01-01",
      "2026-01-02",
      "2026-01-03",
      "2026-01-04",
    ]);
  });
});
