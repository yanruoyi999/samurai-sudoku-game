import { describe, expect, it } from 'vitest';

import {
  CROSS_HATCHING_EXAMPLES,
  analyzeCrossHatching,
} from './cross-hatching';

describe('cross-hatching analysis', () => {
  it('finds the only cell left after row and column exclusions', () => {
    const example = CROSS_HATCHING_EXAMPLES[0];
    const result = analyzeCrossHatching(
      example.board,
      example.digit,
      example.boxRow,
      example.boxColumn,
    );

    expect(result.rowBlocked).toEqual([0, 2]);
    expect(result.columnBlocked).toEqual([0, 2]);
    expect(result.candidates).toEqual([{ row: 1, column: 1 }]);
    expect(result.candidates[0]).toEqual(example.solutionCell);
  });

  it('keeps every surviving cell when cross hatching does not force a placement', () => {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    board[0][8] = 5;
    board[8][0] = 5;

    const result = analyzeCrossHatching(board, 5, 0, 0);

    expect(result.rowBlocked).toEqual([0]);
    expect(result.columnBlocked).toEqual([0]);
    expect(result.candidates).toHaveLength(4);
    expect(result.isForced).toBe(false);
  });

  it('ships three examples whose declared solution is the forced candidate', () => {
    expect(CROSS_HATCHING_EXAMPLES).toHaveLength(3);

    for (const example of CROSS_HATCHING_EXAMPLES) {
      const result = analyzeCrossHatching(
        example.board,
        example.digit,
        example.boxRow,
        example.boxColumn,
      );
      expect(result.isForced).toBe(true);
      expect(result.candidates).toEqual([example.solutionCell]);
    }
  });

  it('rejects malformed boards and out-of-range inputs', () => {
    expect(() => analyzeCrossHatching([[0]], 1, 0, 0)).toThrow('9 rows');
    expect(() =>
      analyzeCrossHatching(Array.from({ length: 9 }, () => Array(9).fill(0)), 0, 0, 0),
    ).toThrow('digit');
    expect(() =>
      analyzeCrossHatching(Array.from({ length: 9 }, () => Array(9).fill(0)), 1, 3, 0),
    ).toThrow('box');
  });
});
