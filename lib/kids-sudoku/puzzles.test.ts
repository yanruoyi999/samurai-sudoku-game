import { describe, expect, it } from 'vitest';

import {
  KIDS_SUDOKU_4X4_PUZZLES,
  KIDS_SUDOKU_6X6_PUZZLES,
  KIDS_SUDOKU_PUZZLES,
} from './puzzles';
import {
  checkKidsSudokuGrid,
  cloneKidsSudokuGrid,
  countKidsSudokuSolutions,
  isValidKidsSudokuSolution,
  type KidsSudokuLevel,
  type KidsSudokuPuzzle,
} from './core';

const LEVELS: KidsSudokuLevel[] = ['easy', 'medium', 'challenge'];

function expectVerifiedLibrary(
  puzzles: readonly KidsSudokuPuzzle[],
  expectedSize: number,
  expectedPerLevel: number,
) {
  expect(puzzles).toHaveLength(expectedSize);
  expect(new Set(puzzles.map((puzzle) => puzzle.id)).size).toBe(expectedSize);

  for (const level of LEVELS) {
    expect(puzzles.filter((puzzle) => puzzle.level === level)).toHaveLength(expectedPerLevel);
  }

  for (const puzzle of puzzles) {
    const { size } = puzzle.spec;
    expect(puzzle.grid).toHaveLength(size);
    expect(puzzle.solution).toHaveLength(size);
    expect(isValidKidsSudokuSolution(puzzle.solution, puzzle.spec)).toBe(true);
    expect(countKidsSudokuSolutions(puzzle.grid, puzzle.spec)).toBe(1);

    let clueCount = 0;
    for (let row = 0; row < size; row += 1) {
      expect(puzzle.grid[row]).toHaveLength(size);
      expect(puzzle.solution[row]).toHaveLength(size);
      for (let column = 0; column < size; column += 1) {
        const given = puzzle.grid[row][column];
        if (given !== 0) {
          clueCount += 1;
          expect(given).toBe(puzzle.solution[row][column]);
        }
      }
    }
    expect(puzzle.clueCount).toBe(clueCount);
  }
}

describe('Kids Sudoku puzzle libraries', () => {
  it('provides 24 verified 4x4 puzzles across three levels', () => {
    expectVerifiedLibrary(KIDS_SUDOKU_4X4_PUZZLES, 24, 8);
    expect(KIDS_SUDOKU_PUZZLES).toBe(KIDS_SUDOKU_4X4_PUZZLES);
  });

  it('provides 12 verified 6x6 puzzles across three levels', () => {
    expectVerifiedLibrary(KIDS_SUDOKU_6X6_PUZZLES, 12, 4);
  });

  it('creates a writable copy without mutating puzzle fixtures', () => {
    const puzzle = KIDS_SUDOKU_4X4_PUZZLES[0];
    const grid = cloneKidsSudokuGrid(puzzle.grid);
    const editable = puzzle.grid.flatMap((row, rowIndex) =>
      row.map((value, columnIndex) => ({ value, rowIndex, columnIndex })),
    ).find((cell) => cell.value === 0);

    expect(editable).toBeDefined();
    if (!editable) return;

    grid[editable.rowIndex][editable.columnIndex] = puzzle.solution[editable.rowIndex][editable.columnIndex];
    expect(puzzle.grid[editable.rowIndex][editable.columnIndex]).toBe(0);
  });

  it('reports incomplete, incorrect, and complete states for library puzzles', () => {
    const puzzle = KIDS_SUDOKU_4X4_PUZZLES[0];
    const incorrect = puzzle.solution.map((row) => [...row]);
    const editable = puzzle.grid.flatMap((row, rowIndex) =>
      row.map((value, columnIndex) => ({ value, rowIndex, columnIndex })),
    ).find((cell) => cell.value === 0);

    expect(editable).toBeDefined();
    if (!editable) return;

    incorrect[editable.rowIndex][editable.columnIndex] =
      incorrect[editable.rowIndex][editable.columnIndex] === 1 ? 2 : 1;

    expect(checkKidsSudokuGrid(puzzle.grid, puzzle)).toBe('incomplete');
    expect(checkKidsSudokuGrid(incorrect, puzzle)).toBe('incorrect');
    expect(checkKidsSudokuGrid(puzzle.solution, puzzle)).toBe('complete');
  });
});
