import { describe, expect, it } from "vitest";

import { SudokuEngine } from "./sudoku/engine";
import { SudokuSolver } from "./sudoku/solver";
import { localToGlobal } from "./sudoku/coordinates";
import type { Puzzle, PuzzleMetadata } from "./sudoku/types";
import {
  PRINTABLE_EXPERT_GUIDED_OPENING,
  PRINTABLE_EXPERT_OPENING_HINT,
  PRINTABLE_STARTER_DIFFICULTIES,
  isPrintableSamplerPreview,
  selectPrintablePaidPack,
  selectPrintableStarterPack,
} from "./printable-pack";
import expertPreview from "../public/puzzles/2026/2026-07-22.json";

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
  it("selects the fixed three-puzzle progression in its intended order", () => {
    const puzzles = [
      puzzle("2026-07-22", "evil"),
      puzzle("2026-07-20", "medium"),
      puzzle("2026-06-29", "easy"),
    ];

    const selected = selectPrintableStarterPack(puzzles);

    expect(selected.map((item) => [item.id, item.difficulty])).toEqual([
      ["2026-06-29", "easy"],
      ["2026-07-20", "medium"],
      ["2026-07-22", "evil"],
    ]);
    expect(isPrintableSamplerPreview("2026-07-22")).toBe(true);
    expect(isPrintableSamplerPreview("2026-07-20")).toBe(false);
  });

  it("fails instead of silently replacing a missing curated puzzle", () => {
    expect(() => selectPrintableStarterPack([])).toThrow(/curated printable sampler/i);
  });

  it("keeps the advertised Expert opening hint tied to a real naked single", () => {
    const engine = new SudokuEngine(expertPreview as Puzzle);

    expect(PRINTABLE_EXPERT_OPENING_HINT).toEqual({
      grid: 0,
      row: 3,
      col: 2,
      value: 7,
      technique: "naked-single",
    });

    for (const expected of PRINTABLE_EXPERT_GUIDED_OPENING) {
      const position = localToGlobal({
        grid: expected.grid as 0 | 1 | 2 | 3 | 4,
        row: expected.row,
        col: expected.col,
      });
      const hint = new SudokuSolver(engine).getHint();

      expect(hint).toMatchObject({
        type: expected.technique,
        position,
        value: expected.value,
      });
      expect([...engine.getCandidates(position)]).toEqual([expected.value]);
      engine.setValue(position, expected.value);
    }
  });

  it("selects a balanced 100-puzzle paid pack", () => {
    const puzzles = PRINTABLE_STARTER_DIFFICULTIES.flatMap((difficulty, difficultyIndex) =>
      Array.from({ length: 30 }, (_, index) =>
        puzzle(
          `2026-${String(difficultyIndex + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
          difficulty,
        ),
      ),
    );

    const selected = selectPrintablePaidPack(puzzles);

    expect(selected).toHaveLength(100);
    for (const difficulty of PRINTABLE_STARTER_DIFFICULTIES) {
      expect(selected.filter((item) => item.difficulty === difficulty)).toHaveLength(25);
    }
  });
});
