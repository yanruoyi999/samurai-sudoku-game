import { describe, expect, it } from 'vitest';

import { getNearbyPuzzles } from './puzzle-links';

const puzzles = [
  { id: '2026-01-05' },
  { id: '2026-01-04' },
  { id: '2026-01-03' },
  { id: '2026-01-02' },
  { id: '2026-01-01' },
];

describe('getNearbyPuzzles', () => {
  it('returns the closest newer and older puzzles around the current puzzle', () => {
    expect(getNearbyPuzzles(puzzles, '2026-01-03', 4).map((puzzle) => puzzle.id)).toEqual([
      '2026-01-04',
      '2026-01-02',
      '2026-01-05',
      '2026-01-01',
    ]);
  });

  it('keeps the oldest puzzle connected to its nearest neighbors', () => {
    expect(getNearbyPuzzles(puzzles, '2026-01-01', 3).map((puzzle) => puzzle.id)).toEqual([
      '2026-01-02',
      '2026-01-03',
      '2026-01-04',
    ]);
  });

  it('falls back to the newest puzzles when the current ID is absent', () => {
    expect(getNearbyPuzzles(puzzles, 'missing', 2)).toEqual(puzzles.slice(0, 2));
  });
});
