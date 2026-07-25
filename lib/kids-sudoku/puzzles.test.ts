import { describe, expect, it } from 'vitest';

import {
  KIDS_SUDOKU_PUZZLES,
  checkKidsSudokuGrid,
  countKidsSudokuSolutions,
  createKidsSudokuGrid,
} from './puzzles';

function sorted(values: number[]) {
  return [...values].sort((left, right) => left - right);
}

function expectValidSolution(solution: number[][]) {
  expect(solution).toHaveLength(4);
  for (const row of solution) {
    expect(row).toHaveLength(4);
    expect(sorted(row)).toEqual([1, 2, 3, 4]);
  }

  for (let column = 0; column < 4; column += 1) {
    expect(sorted(solution.map((row) => row[column]))).toEqual([1, 2, 3, 4]);
  }

  for (let boxRow = 0; boxRow < 2; boxRow += 1) {
    for (let boxColumn = 0; boxColumn < 2; boxColumn += 1) {
      const values: number[] = [];
      for (let row = boxRow * 2; row < boxRow * 2 + 2; row += 1) {
        for (let column = boxColumn * 2; column < boxColumn * 2 + 2; column += 1) {
          values.push(solution[row][column]);
        }
      }
      expect(sorted(values)).toEqual([1, 2, 3, 4]);
    }
  }
}

describe('kids Sudoku puzzle library', () => {
  it('provides exactly three verified 4x4 puzzles', () => {
    expect(KIDS_SUDOKU_PUZZLES).toHaveLength(3);

    for (const puzzle of KIDS_SUDOKU_PUZZLES) {
      expect(puzzle.grid).toHaveLength(4);
      expect(puzzle.solution).toHaveLength(4);
      expectValidSolution(puzzle.solution);
      expect(countKidsSudokuSolutions(puzzle.grid)).toBe(1);

      let countedClues = 0;
      for (let row = 0; row < 4; row += 1) {
        expect(puzzle.grid[row]).toHaveLength(4);
        for (let column = 0; column < 4; column += 1) {
          const given = puzzle.grid[row][column];
          if (given !== 0) {
            countedClues += 1;
            expect(given).toBe(puzzle.solution[row][column]);
          }
        }
      }
      expect(puzzle.clueCount).toBe(countedClues);
    }
  });

  it('creates a writable copy instead of mutating puzzle fixtures', () => {
    const puzzle = KIDS_SUDOKU_PUZZLES[0];
    const grid = createKidsSudokuGrid(puzzle);

    grid[0][1] = 4;

    expect(puzzle.grid[0][1]).toBe(0);
  });

  it('reports incomplete, incorrect, and complete states', () => {
    const puzzle = KIDS_SUDOKU_PUZZLES[0];
    const incomplete = createKidsSudokuGrid(puzzle);
    const incorrect = puzzle.solution.map((row) => [...row]);
    incorrect[0][1] = incorrect[0][1] === 1 ? 2 : 1;

    expect(checkKidsSudokuGrid(incomplete, puzzle)).toBe('incomplete');
    expect(checkKidsSudokuGrid(incorrect, puzzle)).toBe('incorrect');
    expect(checkKidsSudokuGrid(puzzle.solution, puzzle)).toBe('complete');
  });
});
