#!/usr/bin/env tsx

import { readdir } from 'node:fs/promises';
import path from 'node:path';

import { validatePuzzleFile } from './validator';

async function findPuzzleFiles(puzzlesDir: string): Promise<string[]> {
  const entries = await readdir(puzzlesDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(puzzlesDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findPuzzleFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'index.json') {
      files.push(fullPath);
    }
  }

  return files.sort();
}

async function main() {
  const puzzlesDir = process.argv[2] || 'public/puzzles';
  const files = await findPuzzleFiles(puzzlesDir);
  let failed = 0;

  console.log(`Validating ${files.length} puzzle file(s) from ${puzzlesDir}`);

  for (const file of files) {
    const result = await validatePuzzleFile(file);
    if (!result.isValid || !result.hasSolution) {
      failed += 1;
      console.error(`Invalid puzzle: ${file}`);
      result.errors.forEach((error) => console.error(`  - ${error}`));
    } else {
      console.log(`OK ${file}`);
    }
  }

  if (failed > 0) {
    throw new Error(`${failed} puzzle file(s) failed validation`);
  }

  console.log('All puzzle files passed structural validation.');
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

