import { describe, expect, it } from 'vitest';

import {
  KIDS_4X4_SPEC,
  KIDS_6X6_SPEC,
  checkKidsSudokuGrid,
  cloneKidsSudokuGrid,
  countKidsSudokuSolutions,
  isValidKidsSudokuSolution,
  type KidsSudokuPuzzle,
} from './core';

const solved4x4 = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
];

const solved6x6 = [
  [1, 2, 3, 4, 5, 6],
  [4, 5, 6, 1, 2, 3],
  [2, 3, 4, 5, 6, 1],
  [5, 6, 1, 2, 3, 4],
  [3, 4, 5, 6, 1, 2],
  [6, 1, 2, 3, 4, 5],
];

describe('shared Kids Sudoku engine', () => {
  it('defines 4x4 with 2x2 boxes and 6x6 with 2x3 boxes', () => {
    expect(KIDS_4X4_SPEC).toEqual({ size: 4, boxRows: 2, boxColumns: 2 });
    expect(KIDS_6X6_SPEC).toEqual({ size: 6, boxRows: 2, boxColumns: 3 });
  });

  it('validates completed 4x4 and 6x6 solutions', () => {
    expect(isValidKidsSudokuSolution(solved4x4, KIDS_4X4_SPEC)).toBe(true);
    expect(isValidKidsSudokuSolution(solved6x6, KIDS_6X6_SPEC)).toBe(true);

    const duplicateRow = solved6x6.map((row) => [...row]);
    duplicateRow[0][1] = duplicateRow[0][0];
    expect(isValidKidsSudokuSolution(duplicateRow, KIDS_6X6_SPEC)).toBe(false);
  });

  it('counts zero, one, and multiple solutions with a limit', () => {
    const unique4x4 = [
      [1, 0, 3, 0],
      [0, 4, 1, 2],
      [0, 0, 4, 3],
      [0, 3, 0, 0],
    ];
    const impossible4x4 = [
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const empty4x4 = Array.from({ length: 4 }, () => Array(4).fill(0));

    expect(countKidsSudokuSolutions(unique4x4, KIDS_4X4_SPEC)).toBe(1);
    expect(countKidsSudokuSolutions(impossible4x4, KIDS_4X4_SPEC)).toBe(0);
    expect(countKidsSudokuSolutions(empty4x4, KIDS_4X4_SPEC, 2)).toBe(2);
  });

  it('clones grids and reports incomplete, incorrect, and complete states', () => {
    const puzzle: KidsSudokuPuzzle = {
      id: 'test-4x4',
      level: 'easy',
      spec: KIDS_4X4_SPEC,
      clueCount: 8,
      grid: [
        [1, 0, 3, 0],
        [0, 4, 1, 2],
        [0, 0, 4, 3],
        [0, 3, 0, 0],
      ],
      solution: solved4x4,
    };
    const cloned = cloneKidsSudokuGrid(puzzle.grid);
    cloned[0][1] = 2;
    expect(puzzle.grid[0][1]).toBe(0);

    const incorrect = solved4x4.map((row) => [...row]);
    incorrect[0][1] = 4;
    expect(checkKidsSudokuGrid(puzzle.grid, puzzle)).toBe('incomplete');
    expect(checkKidsSudokuGrid(incorrect, puzzle)).toBe('incorrect');
    expect(checkKidsSudokuGrid(solved4x4, puzzle)).toBe('complete');
  });
});
