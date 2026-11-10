import { describe, expect, it } from 'vitest';
import { classicRegions, dailyPuzzleIndex, diagonalPuzzles, isDiagonalPeer } from './puzzles';
import { isComplete } from '../jigsaw/puzzles';

function solve(givens: string, diagonal: boolean): string[] {
  const board = [...givens].map(Number);
  const digits = [1,2,3,4,5,6,7,8,9];
  const unitMap = board.map((_, i) => {
    const r = Math.floor(i / 9), c = i % 9;
    return [
      r, 9 + c, 18 + Number(classicRegions[i]),
      ...(diagonal && r === c ? [27] : []),
      ...(diagonal && r + c === 8 ? [28] : []),
    ];
  });
  const used = Array.from({ length: 29 }, () => new Set<number>());
  board.forEach((v, i) => { if (v) unitMap[i].forEach(u => used[u].add(v)); });
  const solutions: string[] = [];
  function search() {
    let best = -1, options: number[] = [];
    board.forEach((v, i) => {
      if (v) return;
      const candidates = digits.filter(d => unitMap[i].every(u => !used[u].has(d)));
      if (best < 0 || candidates.length < options.length) { best = i; options = candidates; }
    });
    if (best < 0) { solutions.push(board.join('')); return; }
    for (const d of options) {
      board[best] = d;
      unitMap[best].forEach(u => used[u].add(d));
      search();
      unitMap[best].forEach(u => used[u].delete(d));
      board[best] = 0;
      if (solutions.length === 2) return;
    }
  }
  search();
  return solutions;
}

describe('diagonal Sudoku', () => {
  it('uses the two main diagonals, including both through the center, without applying the rule to nearby cells', () => {
    expect(isDiagonalPeer(0, 40)).toBe(true);
    expect(isDiagonalPeer(8, 40)).toBe(true);
    expect(isDiagonalPeer(40, 72)).toBe(true);
    expect(isDiagonalPeer(40, 80)).toBe(true);
    expect(isDiagonalPeer(0, 51)).toBe(false);
    expect(isDiagonalPeer(40, 40)).toBe(false);
  });

  it('ships distinct fixtures that require the extra rule and have one diagonal solution each', () => {
    expect(diagonalPuzzles).toHaveLength(12);
    expect(new Set(diagonalPuzzles.map(p => p.id)).size).toBe(12);
    expect(new Set(diagonalPuzzles.map(p => p.givens)).size).toBe(12);
    expect(new Set(diagonalPuzzles.map(p => p.solution)).size).toBe(12);
    for (const { givens, solution } of diagonalPuzzles) {
      expect(givens).toMatch(/^[0-9]{81}$/);
      expect(solution).toMatch(/^[1-9]{81}$/);
      expect(solve(givens, true)).toEqual([solution]);
      const classicAnswers = solve(givens, false);
      expect(classicAnswers).toHaveLength(2);
      const alternative = [...classicAnswers.find(answer => answer !== solution)!].map(Number);
      expect(isComplete(classicRegions, alternative)).toBe(true);
      expect(isComplete(classicRegions, alternative, isDiagonalPeer)).toBe(false);
      expect(isComplete(classicRegions, [...solution].map(Number), isDiagonalPeer)).toBe(true);
    }
  });

  it('assigns a stable puzzle within a UTC date, and rotates at the next UTC date', () => {
    const first = dailyPuzzleIndex(new Date('2026-11-10T00:00:00Z'));
    expect(dailyPuzzleIndex(new Date('2026-11-10T23:59:59Z'))).toBe(first);
    expect(dailyPuzzleIndex(new Date('2026-11-11T00:00:00Z'))).toBe((first + 1) % 12);
    expect(dailyPuzzleIndex(new Date('2026-11-22T01:00:00Z'))).toBe(first);
  });
});
