import { describe, expect, it } from 'vitest';

import { KIDS_SUDOKU_4X4_PUZZLES } from './puzzles';
import {
  KIDS_SUDOKU_PROGRESS_KEY,
  clearKidsSudokuProgress,
  readKidsSudokuProgress,
  writeKidsSudokuProgress,
  type KidsSudokuProgressRecord,
  type KidsSudokuStorage,
} from './progress';

class MemoryStorage implements KidsSudokuStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const NOW = Date.UTC(2026, 6, 26, 12, 0, 0);

function buildRecord(overrides: Partial<KidsSudokuProgressRecord> = {}): KidsSudokuProgressRecord {
  const puzzle = KIDS_SUDOKU_4X4_PUZZLES[0];
  return {
    version: 1,
    puzzleId: puzzle.id,
    grid: puzzle.grid.map((row) => [...row]),
    completedPuzzleIds: [puzzle.id, puzzle.id],
    updatedAt: NOW,
    ...overrides,
  };
}

describe('Kids Sudoku local progress', () => {
  it('writes and restores a valid record while deduplicating completed IDs', () => {
    const storage = new MemoryStorage();
    writeKidsSudokuProgress(storage, buildRecord());

    const restored = readKidsSudokuProgress(storage, KIDS_SUDOKU_4X4_PUZZLES, NOW);

    expect(restored).not.toBeNull();
    expect(restored?.completedPuzzleIds).toEqual([KIDS_SUDOKU_4X4_PUZZLES[0].id]);
    expect(restored?.grid).toEqual(KIDS_SUDOKU_4X4_PUZZLES[0].grid);
  });

  it('expires and removes records older than 30 days', () => {
    const storage = new MemoryStorage();
    writeKidsSudokuProgress(storage, buildRecord({ updatedAt: NOW - 31 * 24 * 60 * 60 * 1000 }));

    expect(readKidsSudokuProgress(storage, KIDS_SUDOKU_4X4_PUZZLES, NOW)).toBeNull();
    expect(storage.getItem(KIDS_SUDOKU_PROGRESS_KEY)).toBeNull();
  });

  it('rejects malformed JSON, unknown puzzle IDs, and invalid grid dimensions', () => {
    const malformed = new MemoryStorage();
    malformed.setItem(KIDS_SUDOKU_PROGRESS_KEY, '{not-json');
    expect(readKidsSudokuProgress(malformed, KIDS_SUDOKU_4X4_PUZZLES, NOW)).toBeNull();
    expect(malformed.getItem(KIDS_SUDOKU_PROGRESS_KEY)).toBeNull();

    const unknown = new MemoryStorage();
    writeKidsSudokuProgress(unknown, buildRecord({ puzzleId: 'missing-puzzle' }));
    expect(readKidsSudokuProgress(unknown, KIDS_SUDOKU_4X4_PUZZLES, NOW)).toBeNull();

    const invalidGrid = new MemoryStorage();
    writeKidsSudokuProgress(invalidGrid, buildRecord({ grid: [[1, 2], [3, 4]] }));
    expect(readKidsSudokuProgress(invalidGrid, KIDS_SUDOKU_4X4_PUZZLES, NOW)).toBeNull();
  });

  it('clears saved progress explicitly', () => {
    const storage = new MemoryStorage();
    writeKidsSudokuProgress(storage, buildRecord());
    clearKidsSudokuProgress(storage);
    expect(storage.getItem(KIDS_SUDOKU_PROGRESS_KEY)).toBeNull();
  });
});
