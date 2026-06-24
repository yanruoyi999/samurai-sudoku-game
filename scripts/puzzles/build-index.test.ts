import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import type { Puzzle } from '@/lib/sudoku/types';
import { buildPuzzleIndex } from './build-index';

const temporaryDirectories: string[] = [];

async function createTemporaryPuzzleDirectory() {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'samurai-index-'));
  temporaryDirectories.push(directory);
  return directory;
}

async function loadFixture(): Promise<Puzzle> {
  const raw = await readFile(
    path.join(process.cwd(), 'public/puzzles/2026/2026-06-24.json'),
    'utf8',
  );
  return JSON.parse(raw) as Puzzle;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe('buildPuzzleIndex', () => {
  it('creates a deterministic timestamp from puzzle content', async () => {
    const puzzlesDir = await createTemporaryPuzzleDirectory();
    const yearDir = path.join(puzzlesDir, '2026');
    const puzzle = await loadFixture();
    await mkdir(yearDir, { recursive: true });
    await writeFile(
      path.join(yearDir, `${puzzle.id}.json`),
      JSON.stringify(puzzle),
      'utf8',
    );

    const first = await buildPuzzleIndex(puzzlesDir);
    const firstFile = await readFile(path.join(puzzlesDir, 'index.json'), 'utf8');
    const second = await buildPuzzleIndex(puzzlesDir);
    const secondFile = await readFile(path.join(puzzlesDir, 'index.json'), 'utf8');

    expect(first.lastUpdated).toBe(puzzle.metadata.createdAt);
    expect(second).toEqual(first);
    expect(secondFile).toBe(firstFile);
  });

  it('fails without replacing the index when a puzzle file is malformed', async () => {
    const puzzlesDir = await createTemporaryPuzzleDirectory();
    const yearDir = path.join(puzzlesDir, '2026');
    const indexPath = path.join(puzzlesDir, 'index.json');
    await mkdir(yearDir, { recursive: true });
    await writeFile(path.join(yearDir, '2026-06-24.json'), '{broken', 'utf8');
    await writeFile(indexPath, '{"sentinel":true}\n', 'utf8');

    await expect(buildPuzzleIndex(puzzlesDir)).rejects.toThrow(
      'Puzzle index was not written',
    );
    expect(await readFile(indexPath, 'utf8')).toBe('{"sentinel":true}\n');
  });

  it('rejects a puzzle whose ID does not match its filename', async () => {
    const puzzlesDir = await createTemporaryPuzzleDirectory();
    const yearDir = path.join(puzzlesDir, '2026');
    const puzzle = await loadFixture();
    puzzle.id = '2026-06-23';
    await mkdir(yearDir, { recursive: true });
    await writeFile(
      path.join(yearDir, '2026-06-24.json'),
      JSON.stringify(puzzle),
      'utf8',
    );

    await expect(buildPuzzleIndex(puzzlesDir)).rejects.toThrow(
      'Puzzle index was not written',
    );
  });
});
