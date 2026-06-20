#!/usr/bin/env tsx

import { readdir } from 'node:fs/promises';
import path from 'node:path';

import { analyzePuzzleFile } from './difficulty-analyzer';

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

  console.log(`Checking difficulty for ${files.length} puzzle file(s) from ${puzzlesDir}`);

  for (const file of files) {
    const analysis = await analyzePuzzleFile(file);
    console.log(`${file}: ${analysis.difficulty} (${analysis.score}/100)`);
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

