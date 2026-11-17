import { describe, expect, it } from 'vitest';
import { canPlaceStar, isSolved, isForcedFirstSquare, starBattleBoards } from './star-battle';

describe('one-star Star Battle', () => {
  it('rejects row, column, region and diagonal conflicts', () => {
    const board = starBattleBoards[0];
    expect(canPlaceStar(board, [0], 4)).toBe(false);
    expect(canPlaceStar(board, [0], 20)).toBe(false);
    expect(canPlaceStar(board, [0], 16)).toBe(false);
    expect(canPlaceStar(board, [12], 18)).toBe(false);
    expect(canPlaceStar(board, [4], 6)).toBe(true);
    expect(canPlaceStar(board, [], -1)).toBe(false);
  });

  it('finishes only complete legal boards', () => {
    expect(isSolved(starBattleBoards[0], [4, 6, 13, 15, 22])).toBe(true);
    expect(isSolved(starBattleBoards[1], [1, 8, 10, 17, 24])).toBe(true);
    expect(isSolved(starBattleBoards[0], [])).toBe(false);
    expect(isSolved(starBattleBoards[0], [4, 6, 13, 15, 15])).toBe(false);
    expect(isSolved(starBattleBoards[0], [4, 6, 13, 15, 23])).toBe(false);
  });

  it('requires the singleton region in the teaching step', () => {
    expect(isForcedFirstSquare(starBattleBoards[0], 13)).toBe(true);
    expect(isForcedFirstSquare(starBattleBoards[0], 4)).toBe(false);
    expect(isForcedFirstSquare(starBattleBoards[1], 24)).toBe(true);
  });

  it('has exactly one solution on each original board', () => {
    for (const board of starBattleBoards) {
      function count(placed: number[]): number {
        if (placed.length === 5) return Number(isSolved(board, placed));
        return Array.from({ length: 5 }, (_, col) => placed.length * 5 + col)
          .filter(cell => canPlaceStar(board, placed, cell))
          .reduce((sum, cell) => sum + count([...placed, cell]), 0);
      }
      expect(count([])).toBe(1);
    }
  });
});
