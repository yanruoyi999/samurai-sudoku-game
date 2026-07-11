import { describe, expect, it } from "vitest";

import {
  countOverlapGivenEntries,
  countUniqueGivenEntries,
  getDensestGivenGrid,
} from "./puzzle-metrics";
import type { Puzzle } from "./sudoku/types";

function emptyGrid() {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
}

describe("countUniqueGivenEntries", () => {
  it("does not double-count clues in overlapping Samurai Sudoku cells", () => {
    const topLeftInitial = emptyGrid();
    const centerInitial = emptyGrid();
    topLeftInitial[6][6] = 5;
    centerInitial[0][0] = 5;

    const puzzle: Puzzle = {
      id: "2026-07-11",
      difficulty: "easy",
      grids: [
        { initial: topLeftInitial, solution: emptyGrid() },
        { initial: emptyGrid(), solution: emptyGrid() },
        { initial: centerInitial, solution: emptyGrid() },
        { initial: emptyGrid(), solution: emptyGrid() },
        { initial: emptyGrid(), solution: emptyGrid() },
      ],
      metadata: {
        createdAt: "2026-07-11T00:00:00.000Z",
        estimatedTime: 8,
        checksum: "test",
      },
    };

    expect(countUniqueGivenEntries(puzzle)).toBe(1);
    expect(countOverlapGivenEntries(puzzle)).toBe(1);
  });

  it("finds the densest local grid for a suggested starting area", () => {
    const topLeftInitial = emptyGrid();
    const centerInitial = emptyGrid();
    topLeftInitial[0][0] = 1;
    centerInitial[0][0] = 2;
    centerInitial[1][1] = 3;

    const puzzle: Puzzle = {
      id: "2026-07-11",
      difficulty: "easy",
      grids: [
        { initial: topLeftInitial, solution: emptyGrid() },
        { initial: emptyGrid(), solution: emptyGrid() },
        { initial: centerInitial, solution: emptyGrid() },
        { initial: emptyGrid(), solution: emptyGrid() },
        { initial: emptyGrid(), solution: emptyGrid() },
      ],
      metadata: {
        createdAt: "2026-07-11T00:00:00.000Z",
        estimatedTime: 8,
        checksum: "test",
      },
    };

    expect(getDensestGivenGrid(puzzle)).toEqual({ grid: 2, givenCount: 2 });
  });
});
