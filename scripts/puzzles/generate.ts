#!/usr/bin/env tsx

import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { isPuzzleId } from '@/lib/puzzles';
import { generateSamuraiPuzzle } from '@/lib/sudoku/puzzle-generator';
import type { Difficulty } from '@/lib/sudoku/types';
import { calculateChecksum } from '@/lib/utils';
import { buildPuzzleIndex } from './build-index';
import { validatePuzzle } from './validator';

function parseDifficulty(value: string | undefined): Difficulty {
  if (value === 'easy' || value === 'medium' || value === 'hard' || value === 'evil') {
    return value;
  }
  return 'medium';
}

function parseArgs() {
  const args = process.argv.slice(2);
  let difficulty: Difficulty = 'medium';
  let id = new Date().toISOString().slice(0, 10);
  let outputDir = 'public/puzzles';
  let start = '';
  let count = 1;
  let existingMode: 'error' | 'skip' | 'overwrite' = 'error';

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--difficulty') {
      difficulty = parseDifficulty(args[i + 1]);
      i += 1;
    } else if (arg === '--id') {
      id = args[i + 1] || id;
      i += 1;
    } else if (arg === '--output') {
      outputDir = args[i + 1] || outputDir;
      i += 1;
    } else if (arg === '--start') {
      start = args[i + 1] || start;
      i += 1;
    } else if (arg === '--count') {
      const parsed = Number(args[i + 1]);
      count = Number.isInteger(parsed) && parsed > 0 ? parsed : count;
      i += 1;
    } else if (arg === '--skip-existing') {
      existingMode = 'skip';
    } else if (arg === '--overwrite') {
      existingMode = 'overwrite';
    }
  }

  if (!isPuzzleId(id)) {
    throw new Error(`Invalid puzzle ID "${id}". Expected a real date in YYYY-MM-DD format.`);
  }
  if (start && !isPuzzleId(start)) {
    throw new Error(`Invalid start date "${start}". Expected a real date in YYYY-MM-DD format.`);
  }

  return { difficulty, id, outputDir, start, count, existingMode };
}

function addDays(dateId: string, days: number): string {
  const date = new Date(`${dateId}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function pickBatchDifficulty(
  baseDifficulty: Difficulty,
  index: number,
  count: number,
): Difficulty {
  if (count === 1) {
    return baseDifficulty;
  }

  const cycle: Difficulty[] = ['easy', 'medium', 'hard', 'evil'];
  if (baseDifficulty !== 'medium') {
    return baseDifficulty;
  }
  return cycle[index % cycle.length];
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function writePuzzle(
  id: string,
  difficulty: Difficulty,
  outputDir: string,
  existingMode: 'error' | 'skip' | 'overwrite' = 'error',
): Promise<boolean> {
  if (!isPuzzleId(id)) {
    throw new Error(`Invalid puzzle ID "${id}". Expected a real date in YYYY-MM-DD format.`);
  }

  const year = id.slice(0, 4);
  const yearDir = path.join(outputDir, year);
  const filePath = path.join(yearDir, `${id}.json`);

  if (await fileExists(filePath)) {
    if (existingMode === 'skip') {
      console.log(`Puzzle already exists, leaving it unchanged: ${filePath}`);
      return false;
    }
    if (existingMode !== 'overwrite') {
      throw new Error(
        `Puzzle already exists: ${filePath}. Use --skip-existing or --overwrite explicitly.`,
      );
    }
  }

  const puzzle = generateSamuraiPuzzle(difficulty);
  puzzle.id = id;
  puzzle.metadata.createdAt = new Date(`${id}T00:00:00.000Z`).toISOString();
  puzzle.metadata.checksum = calculateChecksum(puzzle);
  puzzle.metadata.tags = Array.from(new Set(['daily', difficulty, ...(puzzle.metadata.tags ?? [])]));

  const validation = validatePuzzle(puzzle);
  if (!validation.isValid || !validation.hasSolution || !validation.hasUniqueSolution) {
    validation.errors.forEach((error) => console.error(`  - ${error}`));
    throw new Error('Generated puzzle failed validation and was not written.');
  }

  await mkdir(yearDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(puzzle, null, 2), 'utf8');

  console.log(`Generated ${difficulty} puzzle: ${filePath}`);
  return true;
}

async function main() {
  const { difficulty, id, outputDir, start, count, existingMode } = parseArgs();
  const startId = start || id;

  for (let index = 0; index < count; index += 1) {
    await writePuzzle(
      addDays(startId, index),
      pickBatchDifficulty(difficulty, index, count),
      outputDir,
      existingMode,
    );
  }

  await buildPuzzleIndex(outputDir);
}

if (require.main === module) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
