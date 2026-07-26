import type { KidsSudokuGrid, KidsSudokuPuzzle } from './core';

export const KIDS_SUDOKU_PROGRESS_KEY = 'kids_sudoku_progress_v1';
export const KIDS_SUDOKU_PROGRESS_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface KidsSudokuStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface KidsSudokuProgressRecord {
  version: 1;
  puzzleId: string;
  grid: KidsSudokuGrid;
  completedPuzzleIds: string[];
  updatedAt: number;
}

function normalizeCompletedPuzzleIds(ids: unknown, knownIds?: Set<string>) {
  if (!Array.isArray(ids)) return [];
  const normalized = ids.filter(
    (value): value is string => typeof value === 'string' && (!knownIds || knownIds.has(value)),
  );
  return [...new Set(normalized)];
}

function isValidGridForPuzzle(grid: unknown, puzzle: KidsSudokuPuzzle): grid is KidsSudokuGrid {
  if (!Array.isArray(grid) || grid.length !== puzzle.spec.size) return false;

  for (let row = 0; row < puzzle.spec.size; row += 1) {
    const currentRow = grid[row];
    if (!Array.isArray(currentRow) || currentRow.length !== puzzle.spec.size) return false;

    for (let column = 0; column < puzzle.spec.size; column += 1) {
      const value = currentRow[column];
      if (!Number.isInteger(value) || value < 0 || value > puzzle.spec.size) return false;
      const given = puzzle.grid[row][column];
      if (given !== 0 && value !== given) return false;
    }
  }

  return true;
}

export function clearKidsSudokuProgress(storage: KidsSudokuStorage) {
  storage.removeItem(KIDS_SUDOKU_PROGRESS_KEY);
}

export function writeKidsSudokuProgress(
  storage: KidsSudokuStorage,
  record: KidsSudokuProgressRecord,
) {
  const normalized: KidsSudokuProgressRecord = {
    version: 1,
    puzzleId: record.puzzleId,
    grid: record.grid.map((row) => [...row]),
    completedPuzzleIds: normalizeCompletedPuzzleIds(record.completedPuzzleIds),
    updatedAt: record.updatedAt,
  };
  storage.setItem(KIDS_SUDOKU_PROGRESS_KEY, JSON.stringify(normalized));
}

export function readKidsSudokuProgress(
  storage: KidsSudokuStorage,
  puzzles: readonly KidsSudokuPuzzle[],
  now = Date.now(),
): KidsSudokuProgressRecord | null {
  const serialized = storage.getItem(KIDS_SUDOKU_PROGRESS_KEY);
  if (!serialized) return null;

  try {
    const parsed = JSON.parse(serialized) as Partial<KidsSudokuProgressRecord>;
    const puzzle = puzzles.find((item) => item.id === parsed.puzzleId);
    const knownIds = new Set(puzzles.map((item) => item.id));

    if (
      parsed.version !== 1
      || !puzzle
      || typeof parsed.updatedAt !== 'number'
      || !Number.isFinite(parsed.updatedAt)
      || now - parsed.updatedAt > KIDS_SUDOKU_PROGRESS_TTL_MS
      || parsed.updatedAt > now + 60_000
      || !isValidGridForPuzzle(parsed.grid, puzzle)
    ) {
      clearKidsSudokuProgress(storage);
      return null;
    }

    return {
      version: 1,
      puzzleId: puzzle.id,
      grid: parsed.grid.map((row) => [...row]),
      completedPuzzleIds: normalizeCompletedPuzzleIds(parsed.completedPuzzleIds, knownIds),
      updatedAt: parsed.updatedAt,
    };
  } catch {
    clearKidsSudokuProgress(storage);
    return null;
  }
}
