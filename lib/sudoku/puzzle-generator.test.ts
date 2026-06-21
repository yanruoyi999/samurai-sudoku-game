import { describe, expect, it } from 'vitest';

import { generateSamuraiPuzzle } from './puzzle-generator';
import {
  countBoardClues,
  countGridClues,
  countSamuraiSolutions,
  getGlobalInitialBoard,
} from './solution-counter';

describe('generateSamuraiPuzzle', () => {
  it('generates puzzles with a unique solution', () => {
    const puzzle = generateSamuraiPuzzle('evil');
    const board = getGlobalInitialBoard(puzzle);

    expect(countSamuraiSolutions(board, 2)).toBe(1);
  });

  it('uses global Samurai clue targets instead of per-grid independent removal', () => {
    const puzzle = generateSamuraiPuzzle('evil');
    const board = getGlobalInitialBoard(puzzle);

    expect(countBoardClues(board)).toBeGreaterThanOrEqual(120);
    expect(Math.min(...countGridClues(board))).toBeGreaterThanOrEqual(24);
  });

  it('randomizes the solution grid between generated puzzles', () => {
    const first = generateSamuraiPuzzle('medium');
    const second = generateSamuraiPuzzle('medium');

    expect(JSON.stringify(first.grids.map((grid) => grid.solution))).not.toBe(
      JSON.stringify(second.grids.map((grid) => grid.solution))
    );
  });
});
