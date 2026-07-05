import { beforeEach, describe, expect, it } from "vitest";

import { SAMPLE_PUZZLE } from "@/lib/sudoku/sample-puzzle";
import type { GlobalPosition } from "@/lib/sudoku/coordinates";
import { useSudokuStore } from "./sudoku-store";

function findEditableSolvedCell(): GlobalPosition {
  const state = useSudokuStore.getState();
  const solution = state.engine?.getSolution();
  if (!solution) throw new Error("sample puzzle must include a solution");

  for (let row = 0; row < solution.length; row += 1) {
    for (let col = 0; col < solution[row].length; col += 1) {
      if (!state.initial[row][col] && solution[row][col] !== 0) {
        return { row, col };
      }
    }
  }

  throw new Error("sample puzzle must include an editable solved cell");
}

function candidateKey(pos: GlobalPosition) {
  return `${pos.row},${pos.col}`;
}

describe("sudoku store candidate undo history", () => {
  beforeEach(() => {
    useSudokuStore.getState().loadPuzzle(SAMPLE_PUZZLE);
  });

  it("undoes and redoes candidate toggles", () => {
    const pos = findEditableSolvedCell();
    const key = candidateKey(pos);

    useSudokuStore.getState().toggleCandidate(pos, 1);
    expect(useSudokuStore.getState().candidates.get(key)?.has(1)).toBe(true);

    useSudokuStore.getState().undo();
    expect(useSudokuStore.getState().candidates.has(key)).toBe(false);

    useSudokuStore.getState().redo();
    expect(useSudokuStore.getState().candidates.get(key)?.has(1)).toBe(true);
  });

  it("restores candidates after clearing notes or undoing a placement", () => {
    const pos = findEditableSolvedCell();
    const key = candidateKey(pos);
    const value = useSudokuStore.getState().engine?.getSolution()?.[pos.row]?.[pos.col];
    if (!value) throw new Error("sample puzzle solution value is required");

    useSudokuStore.getState().toggleCandidate(pos, 1);
    useSudokuStore.getState().clearCell(pos);
    expect(useSudokuStore.getState().candidates.has(key)).toBe(false);

    useSudokuStore.getState().undo();
    expect(useSudokuStore.getState().candidates.get(key)?.has(1)).toBe(true);

    useSudokuStore.getState().setCell(pos, value);
    expect(useSudokuStore.getState().candidates.has(key)).toBe(false);

    useSudokuStore.getState().undo();
    expect(useSudokuStore.getState().candidates.get(key)?.has(1)).toBe(true);
  });
});
