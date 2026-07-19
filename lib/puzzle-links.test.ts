import { describe, expect, it } from 'vitest';

import { getNearbyPuzzles, getPrimaryPrintablePuzzle } from './puzzle-links';

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

describe('getPrimaryPrintablePuzzle', () => {
  it('uses the latest daily puzzle instead of the first starter-pack puzzle', () => {
    const latest = { id: '2026-01-06' };

    expect(getPrimaryPrintablePuzzle(latest, puzzles)?.id).toBe('2026-01-06');
  });

  it('falls back to the starter pack when no daily puzzle is available', () => {
    expect(getPrimaryPrintablePuzzle(undefined, puzzles)?.id).toBe('2026-01-05');
  });
});
