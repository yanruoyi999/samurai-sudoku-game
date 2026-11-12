import { describe, expect, it } from 'vitest';
import { countKidsSudokuSolutions, isValidKidsSudokuSolution } from '@/lib/kids-sudoku/core';
import { parseSudoku, solveSudoku } from '@/lib/sudoku-step-solver/solve';
import { formatSudokuPuzzle, generateStandardSudoku } from './generate';
import { STANDARD_9X9_SPEC } from './puzzles';

function randomFrom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

describe('standard Sudoku generator', () => {
  it('generates distinct 9×9 puzzles with a unique matching solution', () => {
    const puzzleTexts = new Set<string>();
    for (let seed = 1; seed <= 12; seed += 1) {
      const generated = generateStandardSudoku({ random: randomFrom(seed) });
      expect(generated).not.toBeNull();
      if (!generated) throw new Error('Expected a generated puzzle');

      const { grid, solution } = generated;
      const text = formatSudokuPuzzle(grid);
      expect(grid).toHaveLength(81);
      expect(grid.filter(Boolean)).toHaveLength(34);
      expect(solution).toHaveLength(81);
      expect(grid.every((value, index) => value === 0 || value === solution[index])).toBe(true);

      const rows = Array.from({ length: 9 }, (_, row) => grid.slice(row * 9, row * 9 + 9));
      const solutionRows = Array.from({ length: 9 }, (_, row) => solution.slice(row * 9, row * 9 + 9));
      expect(isValidKidsSudokuSolution(solutionRows, STANDARD_9X9_SPEC)).toBe(true);
      expect(countKidsSudokuSolutions(rows, STANDARD_9X9_SPEC)).toBe(1);

      expect(text).toMatch(/^[0-9]{81}$/);
      expect(parseSudoku(text)).toEqual(grid);
      expect(solveSudoku(grid)).toMatchObject({ status: 'unique', solution });
      puzzleTexts.add(text);
    }
    expect(puzzleTexts.size).toBe(12);
  });

  it('skips an immediate repeat and reports when retries cannot avoid it', () => {
    const first = generateStandardSudoku({ random: randomFrom(1) });
    if (!first) throw new Error('Expected a generated puzzle');
    const previous = formatSudokuPuzzle(first.grid);
    const next = generateStandardSudoku({ random: randomFrom(1), previous });
    if (!next) throw new Error('Expected a different puzzle');
    expect(formatSudokuPuzzle(next.grid)).not.toBe(previous);

    const repeated = generateStandardSudoku({ random: () => 0 });
    if (!repeated) throw new Error('Expected a generated puzzle');
    expect(generateStandardSudoku({
      random: () => 0,
      previous: formatSudokuPuzzle(repeated.grid),
    })).toBeNull();
  });
});
