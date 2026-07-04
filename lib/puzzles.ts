import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { getPuzzleYear, isPuzzleId } from '@/lib/puzzle-id';
import type { Puzzle, PuzzleIndex, PuzzleMetadata } from '@/lib/sudoku/types';

const PUZZLES_DIR = path.join(process.cwd(), 'public', 'puzzles');

export { getPuzzleYear, isPuzzleId };

export async function getPuzzleIndex(): Promise<PuzzleIndex> {
  const raw = await readFile(path.join(PUZZLES_DIR, 'index.json'), 'utf8');
  return JSON.parse(raw) as PuzzleIndex;
}

export async function getPuzzleMetadata(puzzleId: string): Promise<PuzzleMetadata | null> {
  if (!isPuzzleId(puzzleId)) return null;
  const index = await getPuzzleIndex();
  return index.puzzles.find((puzzle) => puzzle.id === puzzleId) ?? null;
}

export async function getPuzzle(puzzleId: string): Promise<Puzzle | null> {
  if (!isPuzzleId(puzzleId)) return null;

  try {
    const raw = await readFile(
      path.join(PUZZLES_DIR, getPuzzleYear(puzzleId), `${puzzleId}.json`),
      'utf8',
    );
    return JSON.parse(raw) as Puzzle;
  } catch {
    return null;
  }
}

export function isPuzzleDifficulty(value: string | undefined): value is PuzzleMetadata['difficulty'] {
  return value === 'easy' || value === 'medium' || value === 'hard' || value === 'evil';
}
