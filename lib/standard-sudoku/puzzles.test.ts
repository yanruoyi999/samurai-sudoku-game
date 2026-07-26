import { describe, expect, it } from 'vitest';

import {
  countKidsSudokuSolutions,
  isValidKidsSudokuSolution,
} from '@/lib/kids-sudoku/core';
import {
  selectStandardSudokuPuzzles,
  STANDARD_9X9_SPEC,
  STANDARD_SUDOKU_PUZZLES,
} from '@/lib/standard-sudoku/puzzles';

describe('standard Sudoku printable puzzles', () => {
  it('provides six uniquely solvable puzzles for every difficulty', () => {
    expect(STANDARD_SUDOKU_PUZZLES).toHaveLength(24);

    for (const difficulty of ['easy', 'medium', 'hard', 'expert'] as const) {
      expect(
        STANDARD_SUDOKU_PUZZLES.filter((puzzle) => puzzle.difficulty === difficulty),
      ).toHaveLength(6);
    }

    for (const puzzle of STANDARD_SUDOKU_PUZZLES) {
      expect(isValidKidsSudokuSolution(puzzle.solution, STANDARD_9X9_SPEC)).toBe(true);
      expect(countKidsSudokuSolutions(puzzle.grid, STANDARD_9X9_SPEC, 2)).toBe(1);

      puzzle.grid.forEach((row, rowIndex) => {
        row.forEach((value, columnIndex) => {
          if (value !== 0) {
            expect(value).toBe(puzzle.solution[rowIndex][columnIndex]);
          }
        });
      });
    }
  });

  it('selects a stable bounded set without mutating the source pool', () => {
    const first = selectStandardSudokuPuzzles({
      difficulty: 'mixed',
      count: 6,
      seed: 'classroom',
    });
    const second = selectStandardSudokuPuzzles({
      difficulty: 'mixed',
      count: 6,
      seed: 'classroom',
    });

    expect(first.map((puzzle) => puzzle.id)).toEqual(second.map((puzzle) => puzzle.id));
    expect(first).toHaveLength(6);
    expect(selectStandardSudokuPuzzles({ difficulty: 'easy', count: 100 })).toHaveLength(24);
    expect(STANDARD_SUDOKU_PUZZLES).toHaveLength(24);
  });
});
