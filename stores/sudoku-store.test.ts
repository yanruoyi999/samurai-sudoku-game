import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_PUZZLE } from "@/lib/sudoku/sample-puzzle";
import type { GlobalPosition } from "@/lib/sudoku/coordinates";
import type { Puzzle } from "@/lib/sudoku/types";
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

function findInitialCell(): GlobalPosition {
  const state = useSudokuStore.getState();

  for (let row = 0; row < state.initial.length; row += 1) {
    for (let col = 0; col < state.initial[row].length; col += 1) {
      if (state.initial[row][col]) return { row, col };
    }
  }

  throw new Error("sample puzzle must include an initial cell");
}

function candidateKey(pos: GlobalPosition) {
  return `${pos.row},${pos.col}`;
}

function completeCurrentPuzzle() {
  const state = useSudokuStore.getState();
  const solution = state.engine?.getSolution();
  if (!solution) throw new Error("sample puzzle must include a solution");

  for (let row = 0; row < solution.length; row += 1) {
    for (let col = 0; col < solution[row].length; col += 1) {
      const pos = { row, col };
      if (
        !useSudokuStore.getState().initial[row][col] &&
        useSudokuStore.getState().board[row][col] === 0 &&
        solution[row][col] !== 0
      ) {
        useSudokuStore.getState().setCell(pos, solution[row][col]);
      }
    }
  }
}

function installBrowserStorage() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
  const win = {
    localStorage,
    dispatchEvent: () => true,
  } as unknown as Window;

  (globalThis as { window?: Window }).window = win;
  (globalThis as { localStorage?: unknown }).localStorage = localStorage;

  return { localStorage };
}

afterEach(() => {
  vi.useRealTimers();
  delete (globalThis as { window?: Window }).window;
  delete (globalThis as { localStorage?: unknown }).localStorage;
});

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

  it("keeps a selected given clue immutable", () => {
    const pos = findInitialCell();
    const originalValue = useSudokuStore.getState().board[pos.row][pos.col];

    useSudokuStore.getState().selectCell(pos);
    useSudokuStore.getState().setCell(pos, originalValue === 9 ? 8 : 9);
    useSudokuStore.getState().clearCell(pos);
    useSudokuStore.getState().toggleCandidate(pos, 1);

    const state = useSudokuStore.getState();
    expect(state.selectedCell).toEqual(pos);
    expect(state.board[pos.row][pos.col]).toBe(originalValue);
    expect(state.candidates.has(candidateKey(pos))).toBe(false);
    expect(state.history).toHaveLength(0);
  });
});

describe("sudoku store in-progress recovery", () => {
  beforeEach(() => {
    installBrowserStorage();
    useSudokuStore.getState().loadPuzzle(SAMPLE_PUZZLE);
  });

  it("restores a matching in-progress game when the current progress key belongs to another puzzle", () => {
    const pos = findEditableSolvedCell();
    const value = useSudokuStore.getState().engine?.getSolution()?.[pos.row]?.[pos.col];
    if (!value) throw new Error("sample puzzle solution value is required");

    useSudokuStore.getState().setCell(pos, value);
    expect(useSudokuStore.getState().board[pos.row][pos.col]).toBe(value);

    const otherPuzzle: Puzzle = {
      ...SAMPLE_PUZZLE,
      id: "2026-01-02",
      metadata: {
        ...SAMPLE_PUZZLE.metadata,
        createdAt: "2026-01-02T00:00:00.000Z",
        checksum: "other-puzzle",
      },
    };

    useSudokuStore.getState().loadPuzzle(otherPuzzle);
    expect(useSudokuStore.getState().puzzleId).toBe(otherPuzzle.id);

    useSudokuStore.getState().loadPuzzle(SAMPLE_PUZZLE);

    expect(useSudokuStore.getState().puzzleId).toBe(SAMPLE_PUZZLE.id);
    expect(useSudokuStore.getState().board[pos.row][pos.col]).toBe(value);
  });
});

describe("sudoku store completion timer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-11T00:00:00.000Z"));
    useSudokuStore.getState().loadPuzzle(SAMPLE_PUZZLE);
  });

  it("stops the active timer when the final cell completes the puzzle", () => {
    vi.setSystemTime(new Date("2026-07-11T00:02:05.000Z"));

    completeCurrentPuzzle();

    const state = useSudokuStore.getState();
    expect(state.status).toBe("completed");
    expect(state.elapsedTime).toBe(125);
    expect(state.startTime).toBeNull();
  });
});
