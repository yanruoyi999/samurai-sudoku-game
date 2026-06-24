import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { writePuzzle } from './generate';

const temporaryDirectories: string[] = [];

async function createTemporaryPuzzleDirectory() {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'samurai-generate-'));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe('writePuzzle existing-file behavior', () => {
  it('leaves an existing daily puzzle byte-for-byte unchanged when skipping', async () => {
    const outputDir = await createTemporaryPuzzleDirectory();
    const yearDir = path.join(outputDir, '2026');
    const filePath = path.join(yearDir, '2026-06-24.json');
    const original = '{"sentinel":"do-not-overwrite"}\n';
    await mkdir(yearDir, { recursive: true });
    await writeFile(filePath, original, 'utf8');

    const generated = await writePuzzle('2026-06-24', 'evil', outputDir, 'skip');

    expect(generated).toBe(false);
    expect(await readFile(filePath, 'utf8')).toBe(original);
  });

  it('requires an explicit overwrite mode for an existing puzzle', async () => {
    const outputDir = await createTemporaryPuzzleDirectory();
    const yearDir = path.join(outputDir, '2026');
    const filePath = path.join(yearDir, '2026-06-24.json');
    await mkdir(yearDir, { recursive: true });
    await writeFile(filePath, '{}', 'utf8');

    await expect(writePuzzle('2026-06-24', 'evil', outputDir)).rejects.toThrow(
      'Puzzle already exists',
    );
  });

  it('rejects non-calendar puzzle IDs before writing', async () => {
    const outputDir = await createTemporaryPuzzleDirectory();

    await expect(writePuzzle('2026-02-30', 'easy', outputDir)).rejects.toThrow(
      'Invalid puzzle ID',
    );
  });
});
