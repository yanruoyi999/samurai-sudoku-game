import { describe, expect, it } from 'vitest';

import { selectWorksheetPuzzles } from './worksheet';

describe('Kids Sudoku worksheet selection', () => {
  it('selects deterministic unique 4x4 puzzles for a specific level', () => {
    const first = selectWorksheetPuzzles({
      size: 4,
      level: 'easy',
      count: 6,
      seed: 42,
      includeAnswers: false,
    });
    const second = selectWorksheetPuzzles({
      size: 4,
      level: 'easy',
      count: 6,
      seed: 42,
      includeAnswers: false,
    });

    expect(first.puzzles.map((puzzle) => puzzle.id)).toEqual(
      second.puzzles.map((puzzle) => puzzle.id),
    );
    expect(first.puzzles).toHaveLength(6);
    expect(new Set(first.puzzles.map((puzzle) => puzzle.id)).size).toBe(6);
    expect(first.puzzles.every((puzzle) => puzzle.spec.size === 4 && puzzle.level === 'easy')).toBe(true);
    expect(first.includeAnswers).toBe(false);
  });

  it('selects a mixed 6x6 worksheet with every level represented', () => {
    const selection = selectWorksheetPuzzles({
      size: 6,
      level: 'mixed',
      count: 6,
      seed: 7,
      includeAnswers: true,
    });

    expect(selection.puzzles).toHaveLength(6);
    expect(new Set(selection.puzzles.map((puzzle) => puzzle.id)).size).toBe(6);
    expect(selection.puzzles.every((puzzle) => puzzle.spec.size === 6)).toBe(true);
    expect(new Set(selection.puzzles.map((puzzle) => puzzle.level))).toEqual(
      new Set(['easy', 'medium', 'challenge']),
    );
    expect(selection.includeAnswers).toBe(true);
  });

  it('supports 2 and 4 puzzle worksheets and rejects impossible requests', () => {
    expect(selectWorksheetPuzzles({ size: 4, level: 'medium', count: 2, seed: 1, includeAnswers: false }).puzzles).toHaveLength(2);
    expect(selectWorksheetPuzzles({ size: 6, level: 'challenge', count: 4, seed: 2, includeAnswers: false }).puzzles).toHaveLength(4);

    expect(() => selectWorksheetPuzzles({
      size: 6,
      level: 'easy',
      count: 6,
      seed: 3,
      includeAnswers: false,
    })).toThrow(/not enough verified puzzles/i);
  });

  it('rejects unsupported sizes, levels, and counts', () => {
    expect(() => selectWorksheetPuzzles({ size: 9 as 4, level: 'easy', count: 2, seed: 1, includeAnswers: false })).toThrow();
    expect(() => selectWorksheetPuzzles({ size: 4, level: 'expert' as 'easy', count: 2, seed: 1, includeAnswers: false })).toThrow();
    expect(() => selectWorksheetPuzzles({ size: 4, level: 'easy', count: 3 as 2, seed: 1, includeAnswers: false })).toThrow();
  });
});
